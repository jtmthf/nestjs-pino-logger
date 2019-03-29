import { Type } from '@nestjs/common';
import { isString, isFunction } from '@nestjs/common/utils/shared.utils';

export function sourceName(source?: string | Type<any>) {
  return isString(source)
    ? source
    : isFunction(source)
    ? (source as Function).name
    : '';
}
