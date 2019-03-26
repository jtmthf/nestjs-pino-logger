import { Injectable, LoggerService, Optional } from '@nestjs/common';
import { isObject, isString, isNil } from '@nestjs/common/utils/shared.utils';
import * as pino from 'pino';

const env = process.env.NODE_ENV;
let hasPinoPretty = false;

try {
  require('pino-pretty');
  hasPinoPretty = true;
} catch {}

@Injectable()
export class Logger implements LoggerService {
  private options: pino.LoggerOptions;
  public logger: pino.Logger;

  constructor(@Optional() nameOrOptions?: string | pino.LoggerOptions) {
    this.options = getOptions(nameOrOptions);
    this.logger = pino(this.options);
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
    const logger = isNil(context)
      ? this.logger
      : pino({ ...this.options, name: context });
    logger[level](getMessage(message) as any, ...args);
  }
}

function getMessage(message: any) {
  return isString(message) || isObject(message) ? message : String(message);
}

function getOptions(nameOrOptions?: string | pino.LoggerOptions) {
  return {
    name: isString(nameOrOptions) ? nameOrOptions : 'NestApplication',
    level: env === 'development' ? 'trace' : env === 'test' ? 'silent' : 'info',
    prettyPrint: env === 'development' && hasPinoPretty,
    ...(isObject(nameOrOptions) ? nameOrOptions : {}),
  };
}
