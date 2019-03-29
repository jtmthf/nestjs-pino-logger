import { isString, isObject } from '@nestjs/common/utils/shared.utils';

export function getMessage(message: any) {
  return isString(message) || isObject(message) ? message : String(message);
}
