import { Router } from 'express';
import { AuthResponse } from '@org/shared';
import {
  clearSession,
  getUserBySession,
  login,
  register,
} from '../services/auth.service';
import {
  clearSessionCookie,
  getCookie,
  setSessionCookie,
  SESSION_COOKIE,
} from '../utils/cookies';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ message: 'Email e password sono richieste.' });
    return;
  }

  const result = login(email, password);
  if (!result) {
    res.status(401).json({ message: 'Credenziali non valide.' });
    return;
  }

  setSessionCookie(res, result.sessionId);
  const payload: AuthResponse = { user: result.user };
  res.json(payload);
});

authRouter.post('/register', (req, res) => {
  const { username, email, password } = req.body ?? {};
  if (!username || !email || !password) {
    res.status(400).json({ message: 'Nome, email e password sono richiesti.' });
    return;
  }

  const result = register(username, email, password);
  if ('error' in result) {
    res.status(409).json({ message: 'Email già registrata.' });
    return;
  }

  setSessionCookie(res, result.sessionId);
  const payload: AuthResponse = { user: result.user };
  res.status(201).json(payload);
});

authRouter.get('/me', (req, res) => {
  const sessionId = getCookie(req, SESSION_COOKIE);
  if (!sessionId) {
    res.status(401).json({ message: 'Non autenticato.' });
    return;
  }

  const user = getUserBySession(sessionId);
  if (!user) {
    res.status(401).json({ message: 'Sessione non valida.' });
    return;
  }

  const payload: AuthResponse = { user };
  res.json(payload);
});

authRouter.post('/logout', (req, res) => {
  const sessionId = getCookie(req, SESSION_COOKIE);
  if (sessionId) {
    clearSession(sessionId);
  }
  clearSessionCookie(res);
  res.status(204).send();
});
