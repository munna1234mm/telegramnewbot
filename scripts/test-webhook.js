// Native fetch is available in Node.js 18+

async function test() {
    const BOT_ID = 'ca2cc92c-a437-40eb-9c1b-0e455b5ea9aa';

    console.log(`Testing Webhook for Bot: ${BOT_ID}`);

    const payload = {
        update_id: 123456789,
        message: {
            message_id: 1,
            from: { id: 999, first_name: 'Tester' },
            chat: { id: 999, type: 'private' },
            date: 1672531200,
            text: '/start'
        }
    };

    try {
        const res = await fetch(`http://localhost:3000/api/telegram/webhook/${BOT_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", json);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

test();
