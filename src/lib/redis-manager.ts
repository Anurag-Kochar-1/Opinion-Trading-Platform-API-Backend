import { RedisClientType, createClient } from "redis";
import { TODO } from "../types";
import { logger } from "../utils";

export class RedisManager {
  private client: RedisClientType;
  private publisher: RedisClientType;
  private static instance: RedisManager;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    });
    this.client.connect();
    this.publisher = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    });
    this.publisher.connect();
  }
  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisManager();
    }
    return this.instance;
  }
  public sendAndAwait(message: TODO) {
    return new Promise<TODO>((resolve) => {
      const id = this.getRandomClientId();
      logger(`id => ${id}`);
      this.client.subscribe(id, (message) => {
        logger(`unsubscribing id => ${id}`);
        this.client.unsubscribe(id);
        resolve(JSON.parse(message));
      });
      this.publisher.lPush(
        "messages",
        JSON.stringify({ clientId: id, message })
      );
    });
  }

  public getRandomClientId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
