import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export const SESSION_COOKIE = 'zs_session';
export const CSRF_COOKIE = 'zs_csrf';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const isProd = process.env.NODE_ENV === 'production';
const isSecure = process.env.COOKIE_SECURE === 'true' || isProd;

export const createSessionId = (): string => randomUUID();
export const createCsrfToken = (): string => randomUUID();

export const getCookie = (req: Request, name: string): string | undefined => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return undefined;
  }

  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return undefined;
};

export const setSessionCookie = (res: Response, sessionId: string): void => {
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
};

export const clearSessionCookie = (res: Response): void => {
  res.cookie(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    maxAge: 0,
    path: '/',
  });
};

export const setCsrfCookie = (res: Response, token: string): void => {
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: isSecure,
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
};

export const clearCsrfCookie = (res: Response): void => {
  res.cookie(CSRF_COOKIE, '', {
    httpOnly: false,
    sameSite: 'lax',
    secure: isSecure,
    maxAge: 0,
    path: '/',
  });
};

export const getCsrfCookie = (req: Request): string | undefined =>
  getCookie(req, CSRF_COOKIE);

export const getCsrfHeader = (req: Request): string | undefined => {
  const header = req.headers['x-csrf-token'];
  if (Array.isArray(header)) {
    return header[0];
  }
  return header;
};
