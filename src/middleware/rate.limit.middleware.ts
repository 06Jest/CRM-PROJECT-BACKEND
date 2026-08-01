import rateLimit from "express-rate-limit";

const jsonMessage = (message: string) => ({
  success: false,
  message,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many login attempts. Please try again in 15 minutes."),
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many refresh requests. Please try again later."),
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many requests. Please slow down."),
});

export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Email sending limit reached."),
});

export const smsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("SMS sending limit reached."),
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("AI request limit reached."),
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Upload limit reached."),
});

export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
});

export const updateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 300,
});

export const deleteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 50,
});

export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
});