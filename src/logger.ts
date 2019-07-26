import { LoggerService } from '@nestjs/common';
import { isObject, isString, isNil } from '@nestjs/common/utils/shared.utils';
import * as pino from 'pino';
import { getMessage, getOptions } from './utils';
import { LogManager } from './log-manager';

export class Logger implements LoggerService {
  private logManager: LogManager;

  constructor(nameOptionsOrManager?: string | pino.LoggerOptions | LogManager) {
    this.logManager =
      nameOptionsOrManager instanceof LogManager
        ? nameOptionsOrManager
        : new LogManager(getOptions(nameOptionsOrManager));
  }

  log(message: any, context?: string, ...args: any[]) {
    this.printMessage('info', message, context, ...args);
  }

  error(message: any, trace?: string, context?: string, ...args: any[]) {
    this.printMessage(
      'error',
      {
        msg: isString(message) ? message : 'Error',
        ...(isObject(message) ? message : {}),
        trace,
      },
      context,
      ...args,
    );
  }

  warn(message: any, context?: string, ...args: any[]) {
    this.printMessage('warn', message, context, ...args);
  }

  debug(message: any, context?: string, ...args: any[]) {
    this.printMessage('debug', message, context, ...args);
  }

  verbose(message: any, context?: string, ...args: any[]) {
    this.printMessage('trace', message, context, ...args);
  }

  private printMessage(
    level: pino.Level,
    message: any,
    context?: string,
    ...args: any[]
  ) {
    const logger = this.logManager.getLogger(context);
    logger[level](getMessage(message) as any, ...args);
  }
}
