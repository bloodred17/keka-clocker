import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppService } from './app.service';
import { Twilio } from 'twilio';
import { red } from 'chalk';

@Injectable()
export class TaskService {
  private readonly twilioCred = process.env.TWILIO?.split(':');
  readonly twilioClient: Twilio;

  constructor(private readonly appService: AppService) {
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
  //   console.log('cron is working' + process.env.USERCELL);
  // }
}
