import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  private readonly redisURI = process.env.REDIS;

  constructor() {
    if (!this.redisURI) {
      throw new Error(
        'Redis URI missing. <username>:<password>@<redis>:<port>. Environment variable: REDIS',
      );
    }
  }

  readonly client = createClient({
    url: process.env.REDIS,
  });

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.disconnect();
  }
}
