import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
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
