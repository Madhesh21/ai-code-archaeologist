import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useGraphSummary, useNodeRelationships, useSearchNodes } from '../useGraph';

vi.mock('@/api/client', () => ({
  fetchApi: vi.fn(),
}));

import { fetchApi } from '@/api/client';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useGraphSummary', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches graph summary', async () => {
    const mockSummary = { nodes: 10, relationships: 25 };
    vi.mocked(fetchApi).mockResolvedValueOnce(mockSummary);

    const { result } = renderHook(() => useGraphSummary('repo-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSummary);
  });
});

describe('useNodeRelationships', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches relationships when nodeId provided', async () => {
    const mockRels = [{ type: 'CALLS', sourceId: 'a', targetId: 'b' }];
    vi.mocked(fetchApi).mockResolvedValueOnce(mockRels);

    const { result } = renderHook(() => useNodeRelationships('repo-1', 'node-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRels);
  });

  it('does not fetch when nodeId is null', () => {
    const { result } = renderHook(() => useNodeRelationships('repo-1', null), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchApi).not.toHaveBeenCalled();
  });
});

describe('useSearchNodes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches search results', async () => {
    const mockResults = [{ id: '1', type: 'Function' as const, name: 'login' }];
    vi.mocked(fetchApi).mockResolvedValueOnce(mockResults);

    const { result } = renderHook(() => useSearchNodes('repo-1', 'login'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResults);
  });
});
