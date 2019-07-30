<p align="center">
    <a href="https://travis-ci.org/jtmthf/nestjs-pino-logger"><img src="https://travis-ci.org/jtmthf/nestjs-pino-logger.svg?branch=master"/></a>
    <a href="https://www.npmjs.com/package/nestjs-pino-logger"><img src="https://img.shields.io/npm/v/nestjs-pino-logger.svg"/></a>
    <a href="https://github.com/jtmthf/nestjs-pino-logger/blob/master/LICENSE"><img src="https://img.shields.io/github/license/jtmthf/nestjs-pino-logger.svg"/></a>
    <a href="https://coveralls.io/github/jtmthf/nestjs-pino-logger?branch=master"><img src="https://coveralls.io/repos/github/jtmthf/nestjs-pino-logger/badge.svg?branch=master"/></a>
    <a href="https://npm.packagequality.com/#?package=nestjs-pino-logger"><img src="https://npm.packagequality.com/shield/nestjs-pino-logger.svg"/></a>
    <a href="https://greenkeeper.io/"><img src="https://badges.greenkeeper.io/jtmthf/nestjs-pino-logger.svg"/></a>
</p>
<h1 align="center">Nestjs Pino Logger</h1>

<p align="center">A NestJS logger utilizing <a href="https://github.com/pinojs/pino">pino</a></p>

## Features

- Replace the built-in NestJS logger with one utilizing pino.
- Create a logger per-service using common configuration.
- Automatically log request and response details using a NestJS middleware.
- Pretty prints logs in development mode.
- Inject a per-request logger as a controller param decorator.
- Automatically flush [extreme mode](http://getpino.io/#/docs/extreme) logs on an interval and on process termination.

### Installation

#### Yarn

```bash
yarn add nestjs-pino-logger pino
```

#### NPM

```bash
npm install nestjs-pino-logger pino
```

### Getting Started

Let's register the logger module in `app.module.ts`.

```ts
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino-logger';

@Module({
  imports: [LoggerModule.forRoot()],
})
export class AppModule {}
```

With the logger module initialized, you can now inject `LogManager`
as a dependency.

```ts
import { Injectable } from '@nestjs/common';
import { LogManager } from 'nestjs-pino-logger';
import { Logger } from 'pino';

@Injectable()
export class AppService {
  private readonly log: Logger;

  constructor(logManager: LogManager) {
    this.log = logManager.getLogger(AppService);
  }

  getHello(): string {
    this.log.info('fetching greeting');

    return 'Hello World!';
  }
}
```

In controllers, the `@Log` param decorator can be used to inject a per-request
logger.

```ts
import { Controller, Get } from '@nestjs/common';
import { Log } from 'nestjs-pino-logger';
import { Logger } from 'pino';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Log() log: Logger): string {
    log.info('logging from AppController.getHello');
    return this.appService.getHello();
  }
}
```

If you want to replace the built-in NestJS logger, that can be done in `main.ts`

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });
  await app.listen(3000);
}
bootstrap();
```
