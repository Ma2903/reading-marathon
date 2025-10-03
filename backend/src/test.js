require("dotenv").config();
const amqp = require("amqplib");

const RABBIT_URL = process.env.RABBIT_URL;
const QUEUE = process.env.QUEUE;

async function testar() {
    try {
        console.log("Conectando...");
        const conn = await amqp.connect(RABBIT_URL);
        console.log("✅ Conectado!");
        
        const ch = await conn.createChannel();
        await ch.assertQueue(QUEUE, {durable: true});
        console.log("✅ Fila criada!");
        
        const msg = {teste: true, hora: new Date()};
        ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)));
        console.log("✅ Mensagem enviada:", msg);
        
        setTimeout(() => {
            conn.close();
            process.exit(0);
        }, 1000);
    } catch(error) {
        console.error("❌ Erro:", error.message);
    }
}

testar();