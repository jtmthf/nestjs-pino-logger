import { Type } from '@nestjs/common';
import * as pino from 'pino';
import { sourceName, getOptions } from './utils';
import { LoggerModuleOptions } from './interfaces';

export class LogManager {
  private loggers: Map<string, pino.Logger> = new Map();

  constructor(private readonly options: LoggerModuleOptions = {}) {
    this.loggers.set(
      '',
      pino(
        getOptions(options),
        this.getDestination() as pino.DestinationStream,
      ),
    );

    const { flushInterval = 10000 } = options;
    if (options.extreme && flushInterval) {
      setInterval(() => {
        this.loggers.forEach(logger => {
          logger.flush();
        });
      }, flushInterval).unref();
    }
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
    const destination = this.getDestination();
    const logger = pino(
      {
        ...getOptions(this.options),
        name,
        ...options,
      },
      destination as pino.DestinationStream,
    );
    this.loggers.set(name, logger);
    return logger;
  }

  private getDestination() {
    return this.options.extreme
      ? pino.extreme(this.options.destination)
      : typeof this.options.destination === 'string' ||
        typeof this.options.destination === 'number'
      ? pino.destination(this.options.destination)
      : this.options.destination;
  }
}
