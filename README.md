<p align="center">
<a href="http://keka.com/" target="_blank"><img src="https://d2w2i7rp1a0wob.cloudfront.net/static/images/logos/KekaLogoBlack.svg" width="200" alt="Nest Logo" /></a>
</p>

[//]: # (<p align="center">Made with <a href="http://nestjs.com" target="_blank">NestJS</a>. A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>)

<h1 align="center">Keka Clocker</h1>

## Description

Clocker for [Keka](https://www.keka.com/).

## Features

- Endpoints for __Clocking-In__ and __Clocking-out__
- OTP and Captcha handling

## Requirements

![Static Badge](https://img.shields.io/badge/node-v18.13-green) <br>


Environment variables:
```dotenv
REDIS=""
TWOCAPTCHAKEY=""
```

>I recommend [Volta](https://volta.sh) for version switching.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Working

User will need to send the full OTP message to `/opt/<text_message>` within 10 seconds of receiving the sms. <br>
Can be automated using [Macrodroid](https://play.google.com/store/apps/details?id=com.arlosoft.macrodroid), [Tasker](https://tasker.joaoapps.com/), [IFTTT](https://ifttt.com/) etc.

## Stay in touch

- Author - [Ankur Dutta](https://ankurdutta.me)

## License

Keka Clocker is [MIT licensed](LICENSE).
