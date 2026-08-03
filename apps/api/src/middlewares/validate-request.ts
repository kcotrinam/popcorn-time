import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors/app-error.js';
import { ErrorCode } from '../errors/error-codes.js';
export function validateRequest(schemas: {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
}): RequestHandler {
  return (req, _res, next) => {
    for (const [key, schema] of Object.entries(schemas) as Array<
      [keyof typeof schemas, ZodType | undefined]
    >) {
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (!result.success)
        return next(
          new AppError(
            400,
            ErrorCode.VALIDATION_ERROR,
            'Request validation failed',
            result.error.flatten(),
          ),
        );
      if (key === 'body') req.body = result.data;
    }
    next();
  };
}
