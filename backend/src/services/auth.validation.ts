import { z } from 'zod';
import type { LoginRequest, RegisterRequest } from '@org/shared';

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email e password sono richieste.')
    .email('Email non valida.')
    .transform(normalizeEmail),
  password: z
    .string()
    .min(6, 'La password deve avere almeno 6 caratteri.'),
});

const registerSchema = z.object({
  username: z.string().min(2, 'Il nome deve avere almeno 2 caratteri.'),
  email: z
    .string()
    .min(1, 'Nome, email e password sono richiesti.')
    .email('Email non valida.')
    .transform(normalizeEmail),
  password: z
    .string()
    .min(6, 'La password deve avere almeno 6 caratteri.'),
});

const toResult = <T>(parsed: z.SafeParseReturnType<unknown, T>): ValidationResult<T> => {
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }
  const message = parsed.error.issues[0]?.message ?? 'Dati non validi.';
  return { ok: false, message };
};

export const parseLoginRequest = (
  payload: unknown,
): ValidationResult<LoginRequest> => toResult(loginSchema.safeParse(payload));

export const parseRegisterRequest = (
  payload: unknown,
): ValidationResult<RegisterRequest> => toResult(registerSchema.safeParse(payload));
