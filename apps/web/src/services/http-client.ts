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
    method !== 'GET' &&
    method !== 'HEAD' &&
    (path === '/auth/refresh' || path === '/auth/logout' || path.startsWith('/users/me/library'))
  );
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type GetJsonOptions = {
  query?: QueryParams;
  signal?: AbortSignal;
};

function withQuery(path: string, query?: QueryParams): string {
  if (!query) return path;
  const parameters = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') parameters.set(key, String(value));
  });
  const search = parameters.toString();
  return search ? `${path}?${search}` : path;
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
      ...(init.body ? { 'content-type': 'application/json' } : {}),
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
export const getJson = <T>(path: string, options: GetJsonOptions = {}) =>
  request<T>(withQuery(path, options.query), { signal: options.signal });
export const postJson = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
export const patchJson = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteJson = (path: string) => request<void>(path, { method: 'DELETE' });
export const clearCsrfToken = () => {
  csrfToken = undefined;
};
