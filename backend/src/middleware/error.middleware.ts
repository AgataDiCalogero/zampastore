import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/app-error';
import { mapDbError } from '../utils/db-errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[ErrorHandler]', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  const mapped = mapDbError(err);
  if (mapped) {
    res.status(mapped.status).json({ message: mapped.message });
    return;
  }

  if (
    err instanceof SyntaxError &&
    'status' in err &&
    (err as { status: number }).status === 400
  ) {
    res.status(400).json({ message: 'JSON non valido.' });
    return;
  }

  res.status(500).json({ message: 'Errore interno del server.' });
};
