import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/index.js';
import { AppError } from '../errors/app-error.js';
import { ErrorCode } from '../errors/error-codes.js';
import { logger } from '../lib/logger.js';
export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  let appError: AppError;
  if (error instanceof AppError) appError = error;
  else if (error instanceof ZodError)
    appError = new AppError(
      400,
      ErrorCode.VALIDATION_ERROR,
      'Request validation failed',
      error.flatten(),
    );
  else if (error instanceof Prisma.PrismaClientKnownRequestError)
    appError = new AppError(
      503,
      ErrorCode.SERVICE_UNAVAILABLE,
      'A dependent service is unavailable',
    );
  else {
    logger.error({ err: error, requestId: req.requestId }, 'Unhandled request error');
    appError = new AppError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      undefined,
      false,
    );
  }
  const message =
    !appError.isOperational && env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : appError.message;
  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message,
      requestId: req.requestId,
      ...(appError.details && env.NODE_ENV !== 'production' ? { details: appError.details } : {}),
    },
  });
};
