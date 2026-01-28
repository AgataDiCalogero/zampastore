/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import dotenv from 'dotenv';
import express from 'express';
import * as path from 'node:path';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import { openApiSpec } from './swagger';
import { authRouter } from './routes/auth.routes';
import { productsRouter } from './routes/products.routes';
import { ordersRouter } from './routes/orders.routes';
import { paymentsRouter } from './routes/payments.routes';
import { dbPing } from './services/db';
import { getEnv } from './config/env';

dotenv.config();

const app = express();
const env = getEnv();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api/openapi.json', (req, res) => {
  res.json(openApiSpec);
});
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(openApiSpec));
app.get('/api/health', async (_req, res) => {
  const start = Date.now();
  try {
    const { latencyMs } = await dbPing();
    res.json({
      ok: true,
      db: 'ok',
      latencyMs,
      uptimeMs: Math.round(process.uptime() * 1000),
    });
  } catch {
    res.status(503).json({
      ok: false,
      db: 'error',
      latencyMs: Date.now() - start,
    });
  }
});

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);

const port = env.port;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
