import crypto from "crypto";
import redisClient from "../config/redis";

class LockService {
  private readonly prefix = "lock:";

  async acquire(
    key: string,
    ttlSeconds = 30
  ): Promise<string | null> {
    try {
      const token = crypto.randomUUID();

      const result = await redisClient.set(
        `${this.prefix}${key}`,
        token,
        {
          NX: true,
          EX: ttlSeconds,
        }
      );

      if (result !== "OK") {
        return null;
      }

      return token;
    } catch (error) {
      console.error("Lock ACQUIRE failed:", error);
      return null;
    }
  }

  async release(
    key: string,
    token: string
  ): Promise<boolean> {
    try {
      const lockKey = `${this.prefix}${key}`;

      const result = await redisClient.eval(
        `
          if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
          else
            return 0
          end
        `,
        {
          keys: [lockKey],
          arguments: [token],
        }
      );

      return result === 1;
    } catch (error) {
      console.error("Lock RELEASE failed:", error);
      return false;
    }
  }
}

export default new LockService();