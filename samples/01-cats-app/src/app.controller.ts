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
