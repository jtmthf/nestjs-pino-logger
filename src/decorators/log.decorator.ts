import { createParamDecorator } from '@nestjs/common';

export const Log = createParamDecorator((data, req) => req.log);
