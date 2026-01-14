import { prisma } from '../src/lib/prisma';

// Use native fetch (Node 18+)
const _fetch = global.fetch;

async function runPolling() {
    console.log('🔄 Starting Local Development Polling...');
    console.log('   (Press Ctrl+C to stop)');

    // 1. Fetch Bots from Database
    const bots = await prisma.bot.findMany();

    if (bots.length === 0) {
        console.log('❌ No bots found in database.');
        console.log('👉 Go to http://localhost:3000/dashboard/bots to connect a bot first.');
        return;
    }

    console.log(`✅ Found ${bots.length} bots. Listening for updates...`);

    const offsets: Record<string, number> = {};

    // Remove old webhooks first to allow getUpdates
    for (const bot of bots) {
        try {
            await _fetch(`https://api.telegram.org/bot${bot.token}/deleteWebhook`);
        } catch (e) { }
    }

    const poll = async () => {
        let activeActivity = false;

        for (const bot of bots) {
            try {
                const offset = offsets[bot.id] || 0;
                // Long polling with 10s timeout to keep it responsive but not spammy
                const url = `https://api.telegram.org/bot${bot.token}/getUpdates?offset=${offset + 1}&timeout=10`;

                const res = await _fetch(url);
                const data: any = await res.json();

                if (data.ok && data.result.length > 0) {
                    activeActivity = true;
                    console.log(`📩 [${bot.name}] Received ${data.result.length} messages`);

                    for (const update of data.result) {
                        offsets[bot.id] = update.update_id;

                        // Forward to local webhook handler
                        const webhookRes = await _fetch(`http://localhost:3000/api/telegram/webhook/${bot.id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(update)
                        });

                        if (webhookRes.ok) {
                            // console.log(`   -> Processed`);
                        } else {
                            console.error(`   -> Failed to process: ${webhookRes.status}`);
                        }
                    }
                }
            } catch (e: any) {
                // console.error(`Error polling ${bot.name}:`, e.message);
                if (e.message.includes('409')) {
                    // Conflict: Webhook is set. Clear it.
                    await _fetch(`https://api.telegram.org/bot${bot.token}/deleteWebhook`);
                }
            }
        }

        // Loop
        setTimeout(poll, activeActivity ? 100 : 2000);
    };

    poll();
}

runPolling();
