import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { getCookie, SESSION_COOKIE } from '../utils/cookies';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const sessionId = getCookie(req, SESSION_COOKIE);
  if (!sessionId) {
    res.status(401).json({ message: 'Non autenticato.' });
    return;
  }

  try {
    const user = await authService.getUserBySession(sessionId);
    if (!user) {
      res.status(401).json({ message: 'Sessione non valida.' });
      return;
    }
    req.authUser = user;
    next();
  } catch {
    res.status(500).json({ message: 'Errore durante la verifica sessione.' });
  }
};
