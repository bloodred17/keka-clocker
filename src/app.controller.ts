import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiSuccessResponse } from 'tc-response-model';
import { RedisService } from './redis.service';
import { TaskService } from './task.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
    private readonly taskService: TaskService,
  ) {}

  @Get()
  async getHello(): Promise<ApiResponse> {
    // await this.taskService.sendSMS();
    return ApiResponse.send(new ApiSuccessResponse(null, 'Hello'), []);
  }

  @Get('/otp/:sms')
  async getOtpMessage(@Param('sms') sms: string) {
    try {
      if (!sms) {
        throw new Error('SMS invalid');
      }
      const otp = sms?.match(/Keka.*:\s(\d+)/);
      if (!otp) {
        throw new Error('Not Keka message');
      }
      const [_, value] = otp;
      console.log('otp: ', value);
      await this.redisService.client.set('otp', value, { EX: 60 });
      return ApiResponse.send(
        new ApiSuccessResponse(value, 'OTP received'),
        [],
      );
    } catch (e) {
      return ApiResponse.send(e, []);
    }
  }

  @Get('/clock-in')
  async clockIn() {
    try {
      await this.appService.clock('in');
      return ApiResponse.send(new ApiSuccessResponse(null, 'Clocked In'), []);
    } catch (e) {
      console.log(e);
      return ApiResponse.send(e, []);
    }
  }

  @Get('/clock-out')
  async clockOut() {
    try {
      await this.appService.clock('out');
      return ApiResponse.send(new ApiSuccessResponse(null, 'Clocked Out'), []);
    } catch (e) {
      console.log(e);
      return ApiResponse.send(e, []);
    }
  }
}
