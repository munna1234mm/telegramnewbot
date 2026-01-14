import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const botId = searchParams.get('botId');
    const userId = req.headers.get('x-user-id');

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        if (id) {
            const workflow = await prisma.workflow.findUnique({
                where: { id },
                include: { bot: true }
            });

            if (!workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            if (workflow.bot.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

            // Parse JSON definition if needed, but client likely expects object
            // For now, return raw, client parses? Or we parse here.
            // Let's parse JSON since we stored it as string
            return NextResponse.json({
                ...workflow,
                ...((workflow.definitionJSON) ? JSON.parse(workflow.definitionJSON) : {})
            });
        }

        if (botId) {
            // Check bot ownership first
            const bot = await prisma.bot.findUnique({ where: { id: botId } });
            if (!bot || bot.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

            const workflows = await prisma.workflow.findMany({
                where: { botId }
            });
            return NextResponse.json(workflows);
        }

        return NextResponse.json([]);
    } catch (e) {
        return NextResponse.json({ error: 'Error fetching workflows' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, botId, nodes, edges, name, enabled } = body;

        if (!botId) return NextResponse.json({ error: 'Bot ID required' }, { status: 400 });

        // Verify bot ownership
        const bot = await prisma.bot.findUnique({ where: { id: botId } });
        if (!bot || bot.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const definition = JSON.stringify({ nodes, edges });

        let workflow;
        if (id) {
            // Check existing workflow ownership implicit via botId relation check or explicit fetch
            // But since we are updating, we should verify the workflow belongs to a bot owned by user.
            const existing = await prisma.workflow.findUnique({ where: { id }, include: { bot: true } });
            if (existing && existing.bot.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

            // Update
            workflow = await prisma.workflow.upsert({
                where: { id },
                create: {
                    id, // Assuming client provided ID or we gen new one? Better to let DB gen if new.
                    botId,
                    name: name || 'Untitled Workflow',
                    definitionJSON: definition,
                    enabled: enabled ?? true
                },
                update: {
                    definitionJSON: definition,
                    enabled: enabled ?? true,
                    updatedAt: new Date() // Prisma handles this but explicit is fine
                }
            });
        } else {
            // Create New
            workflow = await prisma.workflow.create({
                data: {
                    botId,
                    name: name || 'Untitled Workflow',
                    definitionJSON: definition,
                    enabled: enabled ?? true
                }
            });
        }

        return NextResponse.json(workflow);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to save workflow' }, { status: 500 });
    }
}
