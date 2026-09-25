import redisClient from "../config/redis";

class IdempotencyService {
  private readonly prefix = "idempotency:";

  private getRedisKey(
    orgId: string,
    memberId: string,
    key: string
  ): string {
    return `${this.prefix}${orgId}:${memberId}:${key}`;
  }

  async get<T>(
    orgId: string,
    memberId: string,
    key: string
  ): Promise<T | null> {
    try {
      const value = await redisClient.get(
        this.getRedisKey(orgId, memberId, key)
      );

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error("Idempotency GET failed:", error);
      return null;
    }
  }

  async set<T>(
    orgId: string,
    memberId: string,
    key: string,
    value: T,
    ttlSeconds = 24 * 60 * 60
  ): Promise<void> {
    try {
      await redisClient.set(
        this.getRedisKey(orgId, memberId, key),
        JSON.stringify(value),
        {
          EX: ttlSeconds,
        }
      );
    } catch (error) {
      console.error("Idempotency SET failed:", error);
    }
  }

  async acquire(
    orgId: string,
    memberId: string,
    key: string,
    ttlSeconds = 24 * 60 * 60
  ): Promise<boolean> {
    try {
      const result = await redisClient.set(
        this.getRedisKey(orgId, memberId, key),
        JSON.stringify({ status: "processing" }),
        {
          NX: true,
          EX: ttlSeconds,
        }
      );

      return result === "OK";
    } catch (error) {
      console.error("Idempotency ACQUIRE failed:", error);
      return false;
    }
  }

  async delete(
    orgId: string,
    memberId: string,
    key: string
  ): Promise<void> {
    try {
      await redisClient.del(
        this.getRedisKey(orgId, memberId, key)
      );
    } catch (error) {
      console.error("Idempotency DELETE failed:", error);
    }
  }
}

export default new IdempotencyService();