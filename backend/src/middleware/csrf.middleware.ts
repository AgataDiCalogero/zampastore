import type { NextFunction, Request, Response } from 'express';
import { getCsrfCookie, getCsrfHeader } from '../utils/cookies';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const requireCsrf = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const cookieToken = getCsrfCookie(req);
  const headerToken = getCsrfHeader(req);
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ message: 'CSRF token non valido.' });
    return;
  }

  next();
};
