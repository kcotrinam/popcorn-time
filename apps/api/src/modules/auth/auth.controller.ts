import type { RequestHandler } from 'express';
import { env } from '../../config/index.js';
import { csrfCookieName, setCsrfCookie } from '../../middlewares/csrf.js';
import { authService } from './auth.service.js';

const accessCookie = 'pt_access';
const refreshCookie = 'pt_refresh';
const context = (req: Parameters<RequestHandler>[0]) => ({
  ip: req.ip,
  userAgent: req.header('user-agent')?.slice(0, 512),
});
function setSessionCookies(res: Parameters<RequestHandler>[1], access: string, refresh: string) {
  const common = {
    secure: env.COOKIE_SECURE,
    httpOnly: true,
    sameSite: 'lax' as const,
    domain: env.COOKIE_DOMAIN,
    path: '/',
  };
  res.cookie(accessCookie, access, { ...common, maxAge: 15 * 60 * 1000 });
  res.cookie(refreshCookie, refresh, { ...common, maxAge: 30 * 24 * 60 * 60 * 1000 });
}
function clearSessionCookies(res: Parameters<RequestHandler>[1]) {
  const common = {
    secure: env.COOKIE_SECURE,
    httpOnly: true,
    sameSite: 'lax' as const,
    domain: env.COOKIE_DOMAIN,
    path: '/',
  };
  res.clearCookie(accessCookie, common);
  res.clearCookie(refreshCookie, common);
  res.clearCookie(csrfCookieName, {
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/',
  });
}
type AuthController = {
  csrf: RequestHandler;
  register: RequestHandler;
  verifyEmail: RequestHandler;
  login: RequestHandler;
  refresh: RequestHandler;
  logout: RequestHandler;
  forgotPassword: RequestHandler;
  resetPassword: RequestHandler;
  me: RequestHandler;
};
export const authController: AuthController = {
  csrf: ((_req, res) => res.json({ csrfToken: setCsrfCookie(res) })) satisfies RequestHandler,
  register: (async (req, res) =>
    res
      .status(202)
      .json({ message: await authService.register(req.body) })) satisfies RequestHandler,
  verifyEmail: (async (req, res) => {
    await authService.verifyEmail(req.body.token);
    res.status(204).send();
  }) satisfies RequestHandler,
  login: (async (req, res) => {
    const session = await authService.login(req.body.email, req.body.password, context(req));
    setSessionCookies(res, session.accessToken, session.refreshToken);
    res.json({ user: session.user });
  }) satisfies RequestHandler,
  refresh: (async (req, res) => {
    const session = await authService.refresh(req.cookies?.[refreshCookie] as string, context(req));
    setSessionCookies(res, session.accessToken, session.refreshToken);
    res.json({ user: session.user });
  }) satisfies RequestHandler,
  logout: (async (req, res) => {
    await authService.logout(req.cookies?.[refreshCookie] as string | undefined);
    clearSessionCookies(res);
    res.status(204).send();
  }) satisfies RequestHandler,
  forgotPassword: (async (req, res) =>
    res.status(202).json({
      message: await authService.forgotPassword(req.body.email),
    })) satisfies RequestHandler,
  resetPassword: (async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.password);
    clearSessionCookies(res);
    res.status(204).send();
  }) satisfies RequestHandler,
  me: (async (req, res) =>
    res.json({
      user: await authService.authenticate(req.cookies?.[accessCookie] as string | undefined),
    })) satisfies RequestHandler,
};
