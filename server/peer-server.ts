import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { ExpressPeerServer } from 'peer';

const PORT = parseInt(process.env.PEERJS_PORT ?? '9000', 10);
const PATH = process.env.PEERJS_PATH ?? '/peerjs';

const app = express();
const server = createServer(app);

// Health check — used by load balancers and uptime monitors
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const peerServer = ExpressPeerServer(server, { path: '/' });
app.use(PATH, peerServer);

peerServer.on('connection', (client) => {
  // Log peer ID only — no payload data is logged to preserve privacy
  console.log(`[peer] + connected    id=${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`[peer] - disconnected id=${client.getId()}`);
});

// The peer package types the error handler with (error: Error)
peerServer.on('error', (error: Error) => {
  console.error('[peer] error', error.message);
});

server.listen(PORT, () => {
  console.log(`[peer] signaling server  → http://localhost:${PORT}${PATH}`);
  console.log(`[peer] health check      → http://localhost:${PORT}/health`);
});
