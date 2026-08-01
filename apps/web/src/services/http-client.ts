export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
let csrfToken: string | undefined;
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

function requiresCsrf(path: string, method: string): boolean {
  return (
    method !== 'GET' && method !== 'HEAD' && (path === '/auth/refresh' || path === '/auth/logout')
  );
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method ?? 'GET';
  const csrfRequired = requiresCsrf(path, method);
  if (csrfRequired && !csrfToken)
    csrfToken = (await request<{ csrfToken: string }>('/auth/csrf')).csrfToken;
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(csrfRequired ? { 'x-csrf-token': csrfToken ?? '' } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => undefined);
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error: { message?: string } }).error.message ?? response.statusText)
        : response.statusText;
    throw new HttpError(response.status, message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const getJson = <T>(path: string) => request<T>(path);
export const postJson = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
export const clearCsrfToken = () => {
  csrfToken = undefined;
};
