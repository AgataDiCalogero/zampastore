import { z } from 'zod';

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const itemSchema = z.object({
  productId: z.string().min(1, 'Prodotto non valido.'),
  qty: z.number().int().min(1, 'Quantità non valida.'),
});

const mergeSchema = z.object({
  items: z.array(itemSchema).min(1, 'Il carrello è vuoto.'),
});

const qtySchema = z.object({
  qty: z.number().int().min(1, 'Quantità non valida.'),
});

const toResult = <T>(parsed: z.SafeParseReturnType<unknown, T>): ValidationResult<T> => {
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }
  const message = parsed.error.issues[0]?.message ?? 'Dati non validi.';
  return { ok: false, message };
};

export const parseCartItem = (payload: unknown): ValidationResult<{ productId: string; qty: number }> =>
  toResult(itemSchema.safeParse(payload));

export const parseCartMerge = (payload: unknown): ValidationResult<{ items: { productId: string; qty: number }[] }> =>
  toResult(mergeSchema.safeParse(payload));

export const parseCartQty = (payload: unknown): ValidationResult<{ qty: number }> =>
  toResult(qtySchema.safeParse(payload));
