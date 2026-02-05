/**
 * Minimal backend to get started.
 */

import dotenv from 'dotenv';
import express from 'express';
import * as path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUI from 'swagger-ui-express';
import { openApiSpec } from './swagger';
import { authRouter } from './routes/auth.routes';
import { productsRouter } from './routes/products.routes';
import { cartRouter } from './routes/cart.routes';
import { ordersRouter } from './routes/orders.routes';
import { paymentsRouter } from './routes/payments.routes';
import { dbPing } from './services/db';
import { authService } from './services/auth.service';
import { getEnv } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import {
  authLimiter,
  checkoutLimiter,
} from './middleware/rate-limit.middleware';
import { productsStore } from './services/products.store';

dotenv.config();

const app = express();
const env = getEnv();

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    allowedHeaders: ['Content-Type', 'x-csrf-token'],
  }),
);

const jsonParser = express.json();
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
    return;
  }
  jsonParser(req, res, next);
});

void (async () => {
  try {
    await productsStore.ensureSeeded();
  } catch (error) {
    console.error('Product seed failed.', error);
  }
})();

const SESSION_CLEANUP_INTERVAL_MS = 1000 * 60 * 10;
const runSessionCleanup = async (): Promise<void> => {
  try {
    const removed = await authService.cleanupExpiredSessions();
    if (removed > 0) {
      console.log(`Cleaned ${removed} expired sessions.`);
    }
  } catch (error) {
    console.error('Session cleanup failed.', error);
  }
};
runSessionCleanup();
setInterval(runSessionCleanup, SESSION_CLEANUP_INTERVAL_MS).unref?.();

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
app.use('/api/cart', cartRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', checkoutLimiter, paymentsRouter);
app.use(errorHandler);

// Local development support
if (!process.env['VERCEL']) {
  const port = env.port;
  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
  });
  server.on('error', console.error);
}

export default app;
