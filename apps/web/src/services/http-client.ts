export class HttpError extends Error { constructor(readonly status: number, message: string) { super(message); this.name = 'HttpError'; } }
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`);
  if (!response.ok) { const body: unknown = await response.json().catch(() => undefined); const message = typeof body === 'object' && body !== null && 'error' in body ? String((body as { error: { message?: string } }).error.message ?? response.statusText) : response.statusText; throw new HttpError(response.status, message); }
  return response.json() as Promise<T>;
}
