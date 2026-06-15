import type { ApiResponse } from '@/types/api';

const API_BASE = '/api/v1';

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Request failed with status ${res.status}`);
  }
  const body: ApiResponse<T> = await res.json();
  if (!body.success) throw new Error(body.error?.message ?? 'Request failed');
  return body.data;
}
