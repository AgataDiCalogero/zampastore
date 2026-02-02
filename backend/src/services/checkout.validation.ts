import { z } from 'zod';
import type { CreateCheckoutSessionRequest } from '@zampa/shared';

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const itemSchema = z.object({
  productId: z.string().min(1, 'Prodotto non valido.'),
  qty: z.number().int().min(1, 'Quantità non valida.'),
});

const addressSchema = z.object({
  firstName: z.string().min(2, 'Nome non valido.'),
  lastName: z.string().min(2, 'Cognome non valido.'),
  address: z.string().min(4, 'Indirizzo non valido.'),
  city: z.string().min(2, 'Città non valida.'),
  postalCode: z.string().min(4, 'CAP non valido.'),
  country: z.string().min(2, 'Paese non valido.'),
});

const checkoutSchema = z.object({
  items: z.array(itemSchema).min(1, 'Il carrello è vuoto.'),
  shippingAddress: addressSchema,
});

export const parseCheckoutRequest = (
  payload: unknown,
): ValidationResult<CreateCheckoutSessionRequest> => {
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dati non validi.';
    return { ok: false, message: firstError };
  }
  return { ok: true, data: parsed.data };
};
