import { isString, isObject } from '@nestjs/common/utils/shared.utils';
import * as pino from 'pino';
import { hasPinoPretty } from './has-pino-pretty';

const env = process.env.NODE_ENV;

export function getOptions(nameOrOptions?: string | pino.LoggerOptions) {
  return {
    name: isString(nameOrOptions) ? nameOrOptions : 'NestApplication',
    level: env === 'development' ? 'trace' : env === 'test' ? 'silent' : 'info',
    prettyPrint: env === 'development' && hasPinoPretty,
    ...(isObject(nameOrOptions) ? nameOrOptions : {}),
  };
}
