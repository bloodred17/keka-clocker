import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppService } from './app.service';
import { Twilio } from 'twilio';
import { red } from 'chalk';
import { RedisService } from './redis.service';
import { formatDate } from './util';

@Injectable()
export class TaskService {
  private readonly twilioCred = process.env.TWILIO?.split(':');
  readonly twilioClient: Twilio;

  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {
    if (this.twilioCred) {
      this.twilioClient = new Twilio(this.twilioCred[0], this.twilioCred[1]);
    } else {
      console.warn(
        red(
          'Task scheduler will not work without Twilio credential <username>:<password>. Environment variable: TWILIO',
        ),
      );
    }
  }

  async sendSMS(body: string) {
    if (!this.twilioClient) {
      console.log(body);
      throw new Error(
        `Twilio client is not set up. Provide Twilio credential <username>:<password>`,
      );
    }
    const message = await this.twilioClient.messages.create({
      from: process.env.TWILIO_NUMBER,
      to: '+91' + process.env.USERCELL,
      body,
    });
    console.log(message);
  }

  // Todo: Check if on leave

  async checkStatus(status: string) {
    const todayDate = formatDate(new Date());
    const statusValue = await this.redisService.client.get(status);
    return statusValue === todayDate;
  }
  // await this.redisService.client.set(status, todayDate, { EX: 60 });

  // @Cron('0 0 10 * * MON-FRI', {
  //   name: 'clock_in',
  //   timeZone: 'Asia/Kolkata',
  // })
  // async clockIn() {
  //   try {
  //     // const clockedIn = await this.checkStatus();
  //     // if (clockedIn) {
  //     //   throw new Error('Already clocked in');
  //     // }
  //     await this.appService.clock('in');
  //     await this.sendSMS('Clocked in');
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  //
  // @Cron('0 30 19 * * MON-FRI', {
  //   name: 'clock_out',
  //   timeZone: 'Asia/Kolkata',
  // })
  // async clockOut() {
  //   await this.appService.clock('out');
  //   await this.sendSMS('Clocked out');
  // }

  // @Cron('*/10 * * * * *', {
  //   name: 'check',
  //   timeZone: 'Asia/Kolkata',
  // })
  // async check() {
  //   console.log('cron is working' + process.env.USERCELL);
  // }
}
