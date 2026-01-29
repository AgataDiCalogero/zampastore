import { z } from 'zod';

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const idSchema = z.string().min(1, 'Identificativo non valido.');

export const parseIdParam = (
  value: unknown,
): ValidationResult<string> => {
  const parsed = idSchema.safeParse(value);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Identificativo non valido.';
    return { ok: false, message };
  }
  return { ok: true, data: parsed.data };
};
