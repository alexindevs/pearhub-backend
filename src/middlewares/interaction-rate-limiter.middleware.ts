import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => req.user?.userId || req.ip || '', // per-user if authenticated
  skip: (req: Request) => {
    const type = req.body?.type;
    return type === 'VIEW';
  }
});

export const interactionRateLimiter = limiter;