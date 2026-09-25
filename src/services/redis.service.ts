import redisClient from '../config/redis';

class RedisService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (ttlSeconds) {
      await redisClient.set(key, serializedValue, {
        EX: ttlSeconds,
      });

      return;
    }

    await redisClient.set(key, serializedValue);
  }

  async delete(key: string): Promise<void> {
    await redisClient.del(key);
  }
}

export default new RedisService();