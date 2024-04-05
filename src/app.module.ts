import { Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwoCaptchaService } from './two-captcha.service';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';
import { ImageUploadService } from './image-upload.service';
import { TaskService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: !!process.env.K_SERVICE,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TwoCaptchaService,
    RedisService,
    ImageUploadService,
    TaskService,
  ],
})
export class AppModule implements OnModuleInit, OnApplicationShutdown {
  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    await this.redisService.connect();
    console.log('Connected to Redis server');
  }

  async onApplicationShutdown() {
    await this.redisService.disconnect();
    console.log('Disconnected from Redis server');
  }
}
