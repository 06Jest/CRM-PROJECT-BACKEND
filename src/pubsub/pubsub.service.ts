import { createClient } from "redis";
import redisClient from "../config/redis";

class PubSubService {
  private subscriber = redisClient.duplicate();

  async connect(): Promise<void> {
    try {
      await this.subscriber.connect();
    } catch (error) {
      console.error("Redis Subscriber connection failed:", error);
    }
  }

  async publish<T>(
    channel: string,
    message: T
  ): Promise<void> {
    try {
      await redisClient.publish(
        channel,
        JSON.stringify(message)
      );
    } catch (error) {
      console.error("Redis PUBLISH failed:", error);
    }
  }

  async subscribe<T>(
    channel: string,
    handler: (message: T) => void
  ): Promise<void> {
    try {
      await this.subscriber.subscribe(
        channel,
        (message) => {
          try {
            const parsed = JSON.parse(message) as T;

            handler(parsed);
          } catch (error) {
            console.error(
              "Redis SUBSCRIBE message parsing failed:",
              error
            );
          }
        }
      );
    } catch (error) {
      console.error("Redis SUBSCRIBE failed:", error);
    }
  }
}

export default new PubSubService();