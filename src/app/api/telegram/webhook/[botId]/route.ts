import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WorkflowEngine } from '@/lib/workflow-engine';
import { TelegramClient } from '@/lib/telegram';

export async function POST(req: NextRequest, { params }: { params: Promise<{ botId: string }> }) {
    const { botId } = await params;

    try {
        const update = await req.json();
        // console.log(`[Bot ${botId}] Update:`, JSON.stringify(update, null, 2));

        // 1. Get Bot
        const bot = await prisma.bot.findUnique({ where: { id: botId } });
        if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });

        // 2. Normalize Update
        let message = update.message;
        let chatId = message?.chat?.id;
        let userText = message?.text;
        let isCallback = false;

        if (update.callback_query) {
            message = update.callback_query.message;
            chatId = message.chat.id;
            userText = update.callback_query.data;
            isCallback = true;

            // Ack callback immediately
            const client = new TelegramClient(bot.token);
            await client.answerCallbackQuery(update.callback_query.id);
        }

        if (!chatId || !userText) return NextResponse.json({ ok: true });

        // 3. Fetch Enabled Workflows
        const workflows = await prisma.workflow.findMany({
            where: { botId, enabled: true }
        });

        // 4. Run Engine
        for (const workflow of workflows) {
            if (!workflow.definitionJSON) continue;

            const engine = new WorkflowEngine(bot.token, workflow);
            const result = await engine.run({
                bot,
                chatId,
                userText,
                isCallback,
                userName: message.from?.first_name
            });

            if (result.status !== 'NO_MATCH') {
                await prisma.executionLog.create({
                    data: {
                        botId: bot.id,
                        workflowId: workflow.id,
                        status: result.status,
                        steps: JSON.stringify(result.steps),
                        error: result.error || null,
                        createdAt: new Date()
                    }
                });
            }
        }

        // 5. Update Last Run
        await prisma.bot.update({
            where: { id: botId },
            data: { lastRun: new Date() }
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('Error processing update:', e);
        return NextResponse.json({ mr: 'robot' }, { status: 200 }); // Always return 200 to Telegram to prevent retry loops
    }
}

