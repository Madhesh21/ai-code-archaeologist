import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchApi } from '../client';

describe('fetchApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns data on successful response', async () => {
    const mockData = { nodes: 5, relationships: 10 };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockData }),
    } as Response);

    const result = await fetchApi<typeof mockData>('/test');
    expect(result).toEqual(mockData);
  });

  it('throws on unsuccessful response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false, error: { message: 'Not found' } }),
    } as Response);

    await expect(fetchApi('/test')).rejects.toThrow('Not found');
  });

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve(null),
    } as Response);

    await expect(fetchApi('/test')).rejects.toThrow('Request failed with status 404');
  });
});
