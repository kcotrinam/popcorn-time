const origin = typeof window === 'undefined' ? '' : window.location.origin;

export const authConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  redirectUri: import.meta.env.VITE_AUTH0_REDIRECT_URI || `${origin}/welcome`,
  logoutUri: import.meta.env.VITE_AUTH0_LOGOUT_URI || origin,
};

export const hasAuthConfiguration = Boolean(authConfig.domain && authConfig.clientId);
