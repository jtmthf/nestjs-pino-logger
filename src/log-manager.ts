import { Type } from '@nestjs/common';
import * as pino from 'pino';
import { sourceName, getOptions } from './utils';

export class LogManager {
  private loggers: Map<string, pino.Logger> = new Map();

  constructor(private readonly options: pino.LoggerOptions = {}) {
    this.loggers.set('', pino(getOptions(options)));
  }

  exists(source?: string | Type<any>) {
    return this.loggers.has(sourceName(source));
  }

  getLogger(
    source?: string | Type<any>,
    options: pino.LoggerOptions = {},
    replace = false,
  ) {
    const name = sourceName(source);
    if (!replace && this.exists(name)) {
      return this.loggers.get(name)!;
    }
    const logger = pino(
      getOptions({
        name,
        ...this.options,
        ...options,
      }),
    );
    this.loggers.set(name, logger);
    return logger;
  }
}
