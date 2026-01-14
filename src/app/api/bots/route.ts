import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        console.log('[API] GET /bots - userId from header:', userId);

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const bots = await prisma.bot.findMany({
            where: { userId },
            include: { workflows: true }
        });

        console.log(`[API] Found ${bots.length} bots for user ${userId}`);
        return NextResponse.json(bots);
    } catch (e) {
        console.error('[API] Error fetching bots:', e);
        return NextResponse.json({ error: 'Failed to fetch bots' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { token, name } = body;

        // Basic validation
        if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

        const newBot = await prisma.bot.create({
            data: {
                name: name || 'New Bot',
                token,
                username: '@bot',
                status: 'ACTIVE',
                userId // Link to user
            }
        });

        return NextResponse.json({ ok: true, bot: newBot });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 });
    }
}
