import { prisma } from '../src/lib/prisma';
import fetch from 'node-fetch'; // You might need to install this or use native fetch in Node 18+

// Native fetch in Node 18+ global context
const _fetch = global.fetch || fetch;

async function runPolling() {
    console.log('🔄 Starting Local Development Polling...');

    // 1. Fetch Bots from Database
    const bots = await prisma.bot.findMany();

    if (bots.length === 0) {
        console.log('❌ No bots found in database.');
        console.log('👉 Go to http://localhost:3000/dashboard/bots to connect a bot first.');
        return;
    }

    console.log(`✅ Found ${bots.length} bots. Listening for updates...`);

    const offsets: Record<string, number> = {};

    const poll = async () => {
        for (const bot of bots) {
            try {
                const offset = offsets[bot.id] || 0;
                // Long polling with 30s timeout
                const url = `https://api.telegram.org/bot${bot.token}/getUpdates?offset=${offset + 1}&timeout=30`;

                const res = await _fetch(url);
                const data: any = await res.json();

                if (data.ok && data.result.length > 0) {
                    // console.log(`[${bot.name}] Received ${data.result.length} updates`);

                    for (const update of data.result) {
                        offsets[bot.id] = update.update_id;

                        // Forward to local webhook handler
                        const webhookRes = await _fetch(`http://localhost:3000/api/telegram/webhook/${bot.id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(update)
                        });

                        // console.log(`   -> Forwarded to webhook: ${webhookRes.status}`);
                    }
                }
            } catch (e: any) {
                console.error(`Error polling ${bot.name}:`, e.message);
                // Wait a bit if error to avoid spamming
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        // Immediate recursion for "continuous" feel (or slight delay)
        setTimeout(poll, 100);
    };

    poll();
}

runPolling();

