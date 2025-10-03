// backend/src/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const amqp = require("amqplib");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let marathonData = {
  totalPaginasLidas: 0,
  participantes: {},
  atividades: [],
};

const RABBIT_URL = process.env.RABBIT_URL || "amqp://admin:admin123@rabbitmq";
const QUEUE = process.env.QUEUE || "maratona_verao_2025";

// --- FUNÇÃO DE CONEXÃO MELHORADA ---
async function conectarRabbitMQ() {
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log("Tentando conectar ao RabbitMQ...");
      const conn = await amqp.connect(RABBIT_URL);
      const ch = await conn.createChannel();
      await ch.assertQueue(QUEUE, { durable: true });
      console.log("✅ Conectado ao RabbitMQ!");
      return { conn, ch };
    } catch (error) {
      console.error("Falha ao conectar com o RabbitMQ:", error.message);
      if (i < maxRetries - 1) {
        console.log(`Nova tentativa em 5 segundos... (${i + 1}/${maxRetries})`);
        await new Promise(res => setTimeout(res, 5000));
      }
    }
  }
  return null; // Retorna nulo se não conseguir conectar
}
// ------------------------------------

async function publicarLeitura(dados) {
  const rabbit = await conectarRabbitMQ();
  if (!rabbit) {
    console.error("Não foi possível publicar a leitura, sem conexão com RabbitMQ.");
    return;
  }
  const { conn, ch } = rabbit;
  const payload = {
    ...dados,
    timestamp: new Date().toISOString(),
  };
  ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
  console.log("📤 Leitura enviada:", payload);
  setTimeout(() => conn.close(), 500);
}

app.post("/leitura", async (req, res) => {
  try {
    const { participantId, bookTitle, pagesRead } = req.body;
    await publicarLeitura({
      marathonId: "verao_2025",
      participantId,
      bookTitle,
      pagesRead: parseInt(pagesRead),
    });
    res.status(200).send({ message: "Leitura registrada com sucesso!" });
  } catch (error) {
    res.status(500).send({ message: "Erro ao registrar leitura." });
  }
});

app.get("/dados-maratona", (req, res) => {
  res.json(marathonData);
});

wss.on("connection", (ws) => {
  console.log("Cliente conectado ao WebSocket");
  ws.send(JSON.stringify({ type: "initialData", data: marathonData }));
  ws.on("close", () => console.log("Cliente desconectado"));
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

async function iniciarConsumidor() {
  const rabbit = await conectarRabbitMQ();
  if (!rabbit) {
    console.error("❌ Falha crítica ao iniciar o consumidor. O servidor não processará mensagens.");
    return; // Sai da função se não houver conexão
  }
  const { ch } = rabbit;
  console.log("👂 Aguardando leituras...");
  ch.consume(
    QUEUE,
    (msg) => {
      if (msg) {
        const payload = JSON.parse(msg.content.toString());
        console.log("📖 Leitura recebida:", payload);

        marathonData.totalPaginasLidas += payload.pagesRead;
        const participante =
          marathonData.participantes[payload.participantId] || {
            paginasLidas: 0,
          };
        participante.paginasLidas += payload.pagesRead;
        marathonData.participantes[payload.participantId] = participante;
        marathonData.atividades.unshift(payload);
        if (marathonData.atividades.length > 10) {
          marathonData.atividades.pop();
        }
        
        broadcast({ type: "update", data: marathonData });
        ch.ack(msg);
      }
    },
    { noAck: false }
  );
}

server.listen(3001, "0.0.0.0", () => {
  console.log("Servidor rodando na porta 3001");
  iniciarConsumidor();
});