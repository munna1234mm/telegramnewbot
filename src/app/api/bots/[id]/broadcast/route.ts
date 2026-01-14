import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TelegramClient } from '@/lib/telegram';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const body = await req.json();
        const { message } = body;

        if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

        const bot = await prisma.bot.findUnique({ where: { id } });
        if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });

        // TODO: Fetch subscribers from real DB relation when available
        const subscribers: string[] = [];

        const client = new TelegramClient(bot.token);
        let successCount = 0;

        for (const chatId of subscribers) {
            try {
                await client.sendMessage(chatId, message);
                successCount++;
            } catch (e) {
                console.error(`Failed to send to ${chatId}`, e);
            }
        }

        return NextResponse.json({ success: true, sent: successCount });
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
