import { Injectable } from '@nestjs/common';
import { Solver } from '2captcha';
import * as process from "process";

export interface BaseSolve {
  default?: any;
}
export interface UserRecaptchaExtra extends BaseSolve {
  invisible?: boolean;
  'data-s'?: string;
  cookies?: string;
  userAgent?: string;
  header_acao?: boolean;
  pingback?: string;
  soft_id?: number;
  proxy?: string;
  proxytype?: string;
}
export interface UserHCaptchaExtra extends BaseSolve {
  header_acao?: boolean;
  pingback?: string;
  proxy?: string;
  proxytype?: string;
}
export interface UserImageCaptchaExtra extends BaseSolve {
  phrase?: 0 | 1;
  regsense?: 0 | 1;
  numeric?: 0 | 1 | 2 | 3 | 4;
  calc?: 0 | 1;
  min_len?: 0 | string;
  max_len?: 0 | string;
  language?: 0 | 1 | 2;
  lang?: string;
}
/**
 * An object containing properties of the captcha solution.
 * @typedef {Object} CaptchaAnswer
 * @param {string} data The solution to the captcha
 * @param {string} id The captcha ID
 */
export interface CaptchaAnswer {
  /** The solution to the captcha */
  data: string;
  /** The ID of the captcha solve */
  id: string;
}
export const captchaOption = 'CAPTCHA_OPTION';
export interface CaptchaInitOption {
  twoCaptchaApiKey?: string;
  antiCaptchaApiKey?: string;
  pollingFrequency?: number;
}

@Injectable()
export class TwoCaptchaService {
  private readonly apiKey: string = process.env.TWOCAPTCHAKEY;
  private readonly solver: Solver = new Solver(this.apiKey);

  async imageCaptcha(
    base64image: string,
    extra?: UserImageCaptchaExtra,
  ): Promise<CaptchaAnswer> {
    return this.solver.imageCaptcha(base64image, extra);
  }
}
