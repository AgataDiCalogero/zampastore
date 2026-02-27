import { Request, Response, NextFunction } from 'express';

const noOpLimiter = (req: Request, res: Response, next: NextFunction) => {
  next();
};

export const rateLimiter = noOpLimiter;
export const authLimiter = noOpLimiter;
export const checkoutLimiter = noOpLimiter;
