import { Injectable } from '@nestjs/common';
import Fsp from 'fs/promises';
import Path from 'path';
import Fs from 'fs';
import { unlink } from 'node:fs/promises';
import { delay } from './util';
import { Browser, ClickOptions, Frame, HandleFor, Page } from 'puppeteer';
import { TwoCaptchaService } from './two-captcha.service';
import { RedisService } from './redis.service';
import { getLaunchOptions, pup } from './puppeteer.extension';
import {ImageUploadService} from "./image-upload.service";

export type ClockType = 'in' | 'out';

@Injectable()
export class AppService {
  public readonly dashboardImage = {
    filename: 'dashboard.png',
    path: Path.join('./cache', 'dashboard.png'),
  };

  constructor(
    private readonly twoCaptchaService: TwoCaptchaService,
    private readonly redisService: RedisService,
    private readonly imageService: ImageUploadService,
  ) {}

  async injectLocalJquery(page: Page | Frame) {
    const file = await Fsp.readFile(
      Path.resolve('./resources', 'javascript', 'jquery-3.6.1.min.js'),
      'utf8',
    );
    const jquery_ev_fn = await page.evaluate((code_str) => code_str, file);
    await page.evaluate(jquery_ev_fn);
  }

  async $click(page: Page, selector: string) {
    await page.evaluate((_selector) => {
      $(_selector).last().trigger('click');
    }, selector);
  }

  async xClick<T extends HTMLElement>(
    page: Page,
    xPath: string,
    options: ClickOptions & { index?: number; timeout?: number } = {},
  ) {
    if (!options?.index) {
      options.index = 0;
    }
    await page.waitForXPath(xPath, { timeout: options?.timeout || 5000 });
    const elements = (await page?.$x(xPath)) as HandleFor<T>[];
    const tempOptions = JSON.parse(JSON.stringify(options));
    try {
      delete tempOptions?.index;
      delete tempOptions?.timeout;
    } catch (e) {}
    const clickOptions: ClickOptions = options;
    await elements[options?.index]?.click(clickOptions);
  }

  createCacheDirectory(dirname: string) {
    const path = Path.join(dirname, '/cache');
    Fs.access(path, function (error) {
      if (error) {
        console.log('Cache does not exist.');
        Fs.mkdir(path, (err) => {
          if (err) {
            return console.error(err);
          }
          console.log('Cache created successfully!');
        });
      } else {
        console.log('Cache exists.');
      }
    });
    return path;
  }

  async login(page: Page) {
    await page.waitForXPath(`//button[contains(.,"Mobile OTP")]`);
    await this.xClick(page, `//button[contains(.,"Mobile OTP")]`, {
      delay: 40,
    });

    await delay(3000);
    await page.type('#mobileNumber', '7077100772', { delay: 40 });

    await delay(1000);
    await this.xClick(page, `//button[contains(.,"Send OTP")]`, { delay: 40 });
    console.log('OTP sent');
    await delay(3000);

    const captchaImageSelector = '#imgCaptcha';
    const captchaImageFilename = './cache/captcha.png';

    try {
      const oldCaptchaFile = await Fsp.readFile(
        Path.resolve(captchaImageFilename),
        'base64',
      );
      if (oldCaptchaFile) {
        await unlink(captchaImageFilename);
      }
    } catch (e) {}

    // Get captcha image and save
    const captchaImg = await page.$(captchaImageSelector);
    if (!captchaImg) {
      throw new Error('Failed to save captcha');
    }
    await captchaImg.screenshot({
      path: captchaImageFilename,
      omitBackground: true,
    });

    const base64Image = Fsp.readFile(
      Path.resolve(captchaImageFilename),
      'base64',
    );
    const solution$ = this.twoCaptchaService
      .imageCaptcha(await base64Image)
      .then((x) => {
        console.log(x);
        return x;
      });

    await delay(20_000);
    const otp = await this.redisService.client.get('otp');
    if (!otp) {
      throw new Error('OTP not found!');
    }
    await page.type('#otp', otp);

    const solution = await solution$;
    await page.type('#captcha', solution?.data);
    await delay(500);

    await this.xClick(page, '//button[contains(.,"Login")]', { delay: 40 });
    let flag = false;
    try {
      await page.waitForXPath('//div[contains(.,"Invalid")]', {
        timeout: 5000,
      });
      flag = true;
    } catch (e) {}
    if (flag) {
      throw new Error('Login failed');
    }
  }

  async close(page: Page, browser: Browser) {
    try {
      await page?.close();
      await browser?.close();
    } catch (err) {}
  }

  async clock(clockType: ClockType) {
    this.createCacheDirectory('./');
    const browser = await pup.launch(getLaunchOptions({ headless: false }));
    const page = await browser.newPage();

    try {
      const context = browser.defaultBrowserContext();
      await context.overridePermissions('https://shipthis.keka.com', [
        'geolocation',
      ]);

      const arr = [0, 1, 2, 3];
      let login = false;
      for await (const _ of arr) {
        try {
          await page.goto('https://shipthis.keka.com', {
            waitUntil: 'networkidle0',
          });
          await this.injectLocalJquery(page);
          await this.login(page);
          login = true;
          break;
        } catch (e) {
          login = false;
        }
      }
      if (!login) {
        throw new Error('Login failed');
      }

      try {
        await page.waitForXPath(`//*[contains(@class, "d-flex dashboard")]`, {timeout: 30_000});
      } catch (e) {
        await page.screenshot({
          path: this.dashboardImage.path,
        });
        const image = await Fsp.readFile(
            this.dashboardImage.path,
        );
        await this.imageService.uploadImage(image);

        throw e;
      }

      const getButtonText = (condition: boolean) =>
        condition ? 'Clock-In' : 'Clock-out';
      const clockingSelector = getButtonText(clockType == 'in');
      const waitSelector = (text: string) => `//button[contains(.,"${text}")]`;
      const buttonSelector = (text: string) => `:contains("${text}")`;
      await page.waitForXPath(waitSelector(clockingSelector), {
        timeout: 10_000,
      });
      await this.injectLocalJquery(page);
      await this.$click(page, buttonSelector(clockingSelector));
      await this.$click(page, buttonSelector(clockingSelector));

      await page.waitForXPath('//button[contains(.,"Confirm")]', {
        timeout: 10_000,
      });

      await page.waitForXPath(waitSelector('Confirm'), { timeout: 15_000 });
      await this.$click(page, buttonSelector('Confirm'));

      await page.waitForXPath(
        waitSelector(getButtonText(!(clockType == 'in'))),
        { timeout: 10_000 }
      );

      await this.close(page, browser);
    } catch (e) {
      console.log(e);

      await this.close(page, browser);
      throw e;
    }
  }
}
