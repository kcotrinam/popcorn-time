import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
const validId = /^[a-zA-Z0-9_-]{8,128}$/;
export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header('x-request-id');
  req.requestId = incoming && validId.test(incoming) ? incoming : randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
};
