import type { ErrorRequestHandler } from 'express';
import { mapDbError } from '../utils/db-errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  void _next;
  const mapped = mapDbError(err);
  if (mapped) {
    res.status(mapped.status).json({ message: mapped.message });
    return;
  }

  if (err instanceof SyntaxError) {
    res.status(400).json({ message: 'Richiesta non valida.' });
    return;
  }

  res.status(500).json({ message: 'Errore interno del server.' });
};
