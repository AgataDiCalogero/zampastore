import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Relaxed from 100
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Troppe richieste. Riprova più tardi.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Relaxed from 100
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Troppe richieste. Riprova più tardi.' },
});

export const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300, // Relaxed from 30
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Troppe richieste. Riprova più tardi.' },
});
