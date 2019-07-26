import { isString, isObject } from '@nestjs/common/utils/shared.utils';
import * as pino from 'pino';
import { hasPinoPretty } from './has-pino-pretty';

const env = process.env.NODE_ENV;
export function getOptions(nameOrOptions?: string | pino.LoggerOptions) {
  const options = {
    name: isString(nameOrOptions) ? nameOrOptions : undefined,
    level: env === 'development' ? 'trace' : env === 'test' ? 'silent' : 'info',
    prettyPrint: env === 'development' && hasPinoPretty,
    ...(isObject(nameOrOptions) ? nameOrOptions : {}),
  };

  delete (options as any).extreme;

  return options;
}
