import * as stream from 'stream';
import * as pino from 'pino';
import { ModuleMetadata, Type, RouteInfo } from '@nestjs/common/interfaces';

export type LoggerModuleOptions = pino.LoggerOptions & {
  httpLogger?: boolean;
  httpLoggerName?: string;
  httpLoggerRoutes?: (string | Type<any> | RouteInfo)[];
  httpLoggerExclude?: (string | RouteInfo)[];
  registerExitHandler?: boolean;
  flushInterval?: number;
} & (
    | {
        extreme: true;
        destination?: string | number;
      }
    | {
        extreme?: false;
        destination?:
          | string
          | number
          | stream.Writable
          | stream.Duplex
          | stream.Transform
          | NodeJS.WritableStream
          | typeof import('sonic-boom');
      });

export interface LoggerOptionsFactory {
  createLoggerOptions(): Promise<LoggerModuleOptions> | LoggerModuleOptions;
}

export interface LoggerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<LoggerOptionsFactory>;
  useClass?: Type<LoggerOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
  inject?: any[];
}
