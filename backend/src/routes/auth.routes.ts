import { Router } from 'express';
import { AuthResponse } from '@zampa/shared';
import { authService } from '../services/auth.service';
import {
  parseLoginRequest,
  parseRegisterRequest,
} from '../services/auth.validation';
import {
  clearSessionCookie,
  clearCsrfCookie,
  createCsrfToken,
  getCookie,
  setCsrfCookie,
  setSessionCookie,
  SESSION_COOKIE,
} from '../utils/cookies';
import { requireCsrf } from '../middleware/csrf.middleware';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  const parsed = parseLoginRequest(req.body);
  if (!parsed.ok) {
    res.status(400).json({ message: parsed.message });
    return;
  }

  try {
    const result = await authService.login(
      parsed.data.email,
      parsed.data.password,
    );
    if (!result) {
      res.status(401).json({ message: 'Credenziali non valide.' });
      return;
    }

    setSessionCookie(res, result.sessionId);
    setCsrfCookie(res, createCsrfToken());
    const payload: AuthResponse = { user: result.user };
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/register', async (req, res, next) => {
  const parsed = parseRegisterRequest(req.body);
  if (!parsed.ok) {
    res.status(400).json({ message: parsed.message });
    return;
  }

  try {
    const result = await authService.register(
      parsed.data.username,
      parsed.data.email,
      parsed.data.password,
    );
    if ('error' in result) {
      res.status(409).json({ message: 'Email già registrata.' });
      return;
    }

    setSessionCookie(res, result.sessionId);
    setCsrfCookie(res, createCsrfToken());
    const payload: AuthResponse = { user: result.user };
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', async (req, res, next) => {
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

    setCsrfCookie(res, createCsrfToken());
    const payload: AuthResponse = { user };
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', requireCsrf, async (req, res, next) => {
  const sessionId = getCookie(req, SESSION_COOKIE);
  try {
    if (sessionId) {
      await authService.clearSession(sessionId);
    }
    clearSessionCookie(res);
    clearCsrfCookie(res);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
