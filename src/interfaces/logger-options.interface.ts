import * as pino from 'pino';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface LoggerModuleOptions extends pino.LoggerOptions {
  httpLogger?: boolean;
}

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
