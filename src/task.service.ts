import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppService } from './app.service';
import { Twilio } from 'twilio';

@Injectable()
export class TaskService {
  private readonly twilioCred = process.env.TWILIO?.split(':');
  readonly twilioClient: Twilio;

  constructor(private readonly appService: AppService) {
    this.twilioClient = new Twilio(this.twilioCred[0], this.twilioCred[1]);
  }

  async sendSMS(body: string) {
    const message = await this.twilioClient.messages.create({
      from: '+13342493624',
      to: '+917077100772',
      body,
    });
    console.log(message);
  }

  // Todo: Check if on leave

  @Cron('0 0 10 * * MON-FRI', {
    name: 'clock_in',
    timeZone: 'Asia/Kolkata',
  })
  async clockIn() {
    await this.appService.clock('in');
    await this.sendSMS('Clocked in');
  }

  @Cron('0 30 19 * * MON-FRI', {
    name: 'clock_out',
    timeZone: 'Asia/Kolkata',
  })
  async clockOut() {
    await this.appService.clock('out');
    await this.sendSMS('Clocked out');
  }

  // @Cron('*/10 * * * * *', {
  //   name: 'check',
  //   timeZone: 'Asia/Kolkata',
  // })
  // async check() {
  //   console.log('cron is working');
  // }
}
