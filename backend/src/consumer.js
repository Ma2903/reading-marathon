require('dotenv').config();
const amqp = require('amqplib');

const RABBIT_URL = process.env.RABBIT_URL;
const QUEUE = process.env.QUEUE;

async function receberLeituras() {
    const conn = await amqp.connect(RABBIT_URL);
    const ch = await conn.createChannel();
    await ch.assertQueue(QUEUE, { durable: true });
    ch.prefetch(1);
    
    console.log("👂 Aguardando leituras...");
    
    ch.consume(QUEUE, (msg) => {
        if(!msg) return;
        const payload = JSON.parse(msg.content.toString());
        console.log(`📖 ${payload.participantId} leu ${payload.pagesRead} páginas de "${payload.bookTitle}"`);
        ch.ack(msg);
    }, { noAck: false });
}

receberLeituras();