import redisClient from "../config/redis";
import lockService from "../lock/lock.service";

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error("Cache GET failed:", error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);

      if (ttlSeconds) {
        await redisClient.set(key, serializedValue, {
          EX: ttlSeconds,
        });

        return;
      }

      await redisClient.set(key, serializedValue);
    } catch (error) {
      console.error("Cache SET failed:", error);
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const lockKey = `cache:${key}`;
    const lockToken = await lockService.acquire(lockKey, 30);

    if (!lockToken) {
      const retryCached = await this.get<T>(key);

      if (retryCached !== null) {
        return retryCached;
      }

      return fetcher();
    }

    try {
      const lockedCached = await this.get<T>(key);

      if (lockedCached !== null) {
        return lockedCached;
      }

      const value = await fetcher();

      await this.set(key, value, ttlSeconds);

      return value;
    } finally {
      await lockService.release(lockKey, lockToken);
    }
  }
    async delete(key: string): Promise<void> {
      try {
        await redisClient.del(key);
      } catch (error) {
        console.error("Cache DELETE failed:", error);
      }
    }

  async deleteByPrefix(prefix: string): Promise<void> {
    try {
      let cursor = "0";
      const keys: string[] = [];

      do {
        const result = await redisClient.scan(cursor, {
          MATCH: `${prefix}*`,
          COUNT: 100,
        });

        cursor = result.cursor;
        keys.push(...result.keys);
      } while (cursor !== "0");

      if (keys.length === 0) {
        return;
      }

      await redisClient.del(keys);
    } catch (error) {
      console.error("Cache INVALIDATION failed:", error);
    }
  }
}

export default new CacheService();