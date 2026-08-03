import type { RequestHandler } from 'express';
import { authService } from '../modules/auth/auth.service.js';

export const requireAuthentication: RequestHandler = async (req, _res, next) => {
  try {
    await authService.authenticate(req.cookies?.pt_access as string | undefined);
    next();
  } catch (error) {
    next(error);
  }
};
