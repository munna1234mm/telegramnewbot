import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const userId = req.headers.get('x-user-id');

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bot = await prisma.bot.findUnique({ where: { id } });
    if (!bot || bot.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const logs = await prisma.executionLog.findMany({
        where: { botId: id },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to last 50
        include: { workflow: { select: { name: true } } }
    });

    return NextResponse.json(logs);
}
