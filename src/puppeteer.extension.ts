import { PuppeteerLaunchOptions, executablePath } from 'puppeteer';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export const getLaunchOptions = (
  options?: PuppeteerLaunchOptions,
  args?: string[],
  override?: boolean,
) => {
  let _args = ['--no-sandbox'];
  if (!!args && args?.length > 0 && override) {
    _args = args;
  } else if (!!args && args?.length > 0 && !override) {
    _args = [..._args, ...args];
  }

  return {
    args: _args,

    // Default options
    executablePath: executablePath(),
    ignoreHTTPSErrors: true,

    // Custom options
    ...options,
  };
};

export { puppeteer as pup };
