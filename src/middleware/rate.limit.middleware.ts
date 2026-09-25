
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis";

const createRedisStore = (prefix: string) =>
  new RedisStore({
    prefix,
    sendCommand: (...args: string[]) =>
      redisClient.sendCommand(args),
  });

const jsonMessage = (message: string) => ({
  success: false,
  message,
});

export const loginLimiter = rateLimit({
  store: createRedisStore("rl:login:"),
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage(
    "Too many login attempts. Please try again in 15 minutes."
  ),
});

export const refreshLimiter = rateLimit({
  store: createRedisStore("rl:refresh:"),
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage(
    "Too many refresh requests. Please try again later."
  ),
});

export const apiLimiter = rateLimit({
  store: createRedisStore("rl:api:"),
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage(
    "Too many requests. Please slow down."
  ),
});

export const emailLimiter = rateLimit({
  store: createRedisStore("rl:email:"),
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage(
    "Email sending limit reached."
  ),
});

export const smsLimiter = rateLimit({
  store: createRedisStore("rl:sms:"),
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage(
    "SMS sending limit reached."
  ),
});

export const aiLimiter = rateLimit({
  store: createRedisStore("rl:ai:"),
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage(
    "AI request limit reached."
  ),
});

export const uploadLimiter = rateLimit({
  store: createRedisStore("rl:upload:"),
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage(
    "Upload limit reached."
  ),
});

export const createLimiter = rateLimit({
  store: createRedisStore("rl:create:"),
  windowMs: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const updateLimiter = rateLimit({
  store: createRedisStore("rl:update:"),
  windowMs: 60 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

export const deleteLimiter = rateLimit({
  store: createRedisStore("rl:delete:"),
  windowMs: 60 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

export const readLimiter = rateLimit({
  store: createRedisStore("rl:read:"),
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

