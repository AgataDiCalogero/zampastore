import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';

const shouldSkipRateLimit = (): boolean =>
  process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true';

const createLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
}): RateLimitRequestHandler =>
  rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: shouldSkipRateLimit,
    handler: (_req, res, _next, config) => {
      const statusCode =
        typeof config.statusCode === 'number' ? config.statusCode : 429;
      res.status(statusCode).json({ message: options.message });
    },
  });

export const rateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Troppe richieste, riprova tra qualche minuto.',
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: 'Troppi tentativi di autenticazione, riprova più tardi.',
});

export const checkoutLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Troppi tentativi di checkout, riprova tra qualche minuto.',
});
