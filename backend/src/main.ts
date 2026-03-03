import 'dotenv/config';
import express from 'express';
import * as path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUI from 'swagger-ui-express';
import { openApiSpec } from './swagger';
import { authRouter } from './routes/auth.routes';
import { productsRouter } from './routes/products.routes';
import { cartRouter } from './routes/cart.routes';
import { ordersRouter } from './routes/orders.routes';
import { paymentsRouter } from './routes/payments.routes';
import { dbPing } from './services/db';
import { getEnv } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import {
  authLimiter,
  rateLimiter,
} from './middleware/rate-limit.middleware';
import { requireCsrf } from './middleware/csrf.middleware';
import { productsStore } from './services/products.store';

const app = express();
const env = getEnv();
const isProduction = process.env.NODE_ENV === 'production';
const normalizePath = (pathValue: string): string => {
  if (pathValue.length > 1 && pathValue.endsWith('/')) {
    return pathValue.slice(0, -1);
  }
  return pathValue;
};
const getRequestPath = (req: express.Request): string =>
  normalizePath(req.path || req.originalUrl.split('?')[0] || '/');
const isWebhookRequest = (req: express.Request): boolean =>
  req.method === 'POST' && getRequestPath(req) === '/api/payments/webhook';
const isAuthPublicRequest = (req: express.Request): boolean => {
  if (req.method !== 'POST') {
    return false;
  }
  const requestPath = getRequestPath(req);
  return requestPath === '/api/auth/login' || requestPath === '/api/auth/register';
};

app.disable('x-powered-by');
if (process.env.VERCEL) {
  app.set('trust proxy', 1);
}
app.use(helmet());

// CSP Exception for Swagger UI
app.use(
  '/api/docs',
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: env.clientUrl || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-csrf-token',
      'x-e2e-test',
    ],
  }),
);

app.use(cookieParser());
app.use(rateLimiter);

// JSON Parser with Webhook Exception
const jsonParser = express.json();
app.use((req, res, next) => {
  if (isWebhookRequest(req)) {
    next();
  } else {
    jsonParser(req, res, next);
  }
});

// CSRF Protection (Skip for Auth & Webhooks)
const csrfMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (isWebhookRequest(req) || isAuthPublicRequest(req)) {
    next();
    return;
  }
  requireCsrf(req, res, next);
};
app.use(csrfMiddleware);

if (!isProduction) {
  void (async () => {
    try {
      await productsStore.ensureSeeded();
    } catch (error) {
      console.error('Product seed failed.', error);
    }
  })();
}

// Session cleanup should be handled by an external Cron job (e.g. Vercel Cron)
// to avoid keeping the process alive or issues in serverless environments.
// const runSessionCleanup = async () => { ... }

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
app.use('/api/payments', paymentsRouter);
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
