import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const bot = await prisma.bot.findUnique({
            where: { id },
            include: { workflows: true }
        });

        if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        if (bot.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        return NextResponse.json(bot);
    } catch (e) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify ownership
        const bot = await prisma.bot.findUnique({ where: { id } });
        if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        if (bot.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // Delete (Cascade should handle relations if configured, checking schema...)
        // In schema.prisma:
        // workflows Workflow[]
        // logs ExecutionLog[]
        // We need to manually delete relations if cascade isn't set in DB, 
        // Prisma Client handles explicit cascade if we use onDelete: Cascade in schema, 
        // but let's manual delete to be safe or assuming schema default.
        // Actually, let's just delete the bot. If it fails due to FK, we fix schema.

        // Deleting related workflows first to avoid constraint errors if not cascade
        await prisma.executionLog.deleteMany({ where: { botId: id } });
        await prisma.workflow.deleteMany({ where: { botId: id } });
        await prisma.bot.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Delete error:', e);
        return NextResponse.json({ error: 'Failed to delete bot' }, { status: 500 });
    }
}
