import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { ErrorCode } from '../errors/error-codes.js';
export const notFound: RequestHandler = (req) => {
  throw new AppError(
    404,
    ErrorCode.NOT_FOUND,
    `Route ${req.method} ${req.originalUrl} was not found`,
  );
};
