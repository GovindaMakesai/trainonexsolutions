import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const skip = () => env.nodeEnv === 'test';

function tooMany(message: string) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    handler(_req, res) {
      res.status(429).json({ success: false, message });
    },
  });
}

export const apiLimiter = tooMany('Too many requests. Please wait a moment and try again.');

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler(_req, res) {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Try again in a few minutes.',
    });
  },
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler(_req, res) {
    res.status(429).json({
      success: false,
      message: 'You have sent several messages. Please try again later.',
    });
  },
});
