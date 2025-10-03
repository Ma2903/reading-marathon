// backend/src/producer.js
require("dotenv").config();
const amqp = require("amqplib");

const RABBIT_URL = process.env.RABBIT_URL || "amqp://admin:admin123@rabbitmq";
const QUEUE = process.env.QUEUE || "maratona_verao_2025";

async function publicarLeitura(participante, livro, paginas) {
  try {
    const conn = await amqp.connect(RABBIT_URL);
    const ch = await conn.createChannel();
    await ch.assertQueue(QUEUE, { durable: true });

    const payload = {
      marathonId: "verao_2025",
      participantId: participante,
      bookTitle: livro,
      pagesRead: parseInt(paginas),
      timestamp: new Date().toISOString(),
    };

    ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
    console.log("📤 Leitura enviada:", payload);

    setTimeout(() => conn.close(), 500);
  } catch (error) {
    console.error("Erro ao publicar leitura:", error);
  }
}

// Usar: node src/producer.js "João" "1984" 45
const [participante, livro, paginas] = process.argv.slice(2);

if (participante && livro && paginas) {
  publicarLeitura(participante, livro, paginas);
} else {
  console.log('Uso: node src/producer.js "Nome" "Livro" paginas');
}