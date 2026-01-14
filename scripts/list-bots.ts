import { prisma } from '../src/lib/prisma';

async function listBots() {
    const bots = await prisma.bot.findMany();
    console.log('--- Bots ---');
    bots.forEach(b => {
        console.log(`ID: ${b.id} | Name: ${b.name} | Token: ${b.token.substring(0, 10)}...`);
    });
}

listBots();
