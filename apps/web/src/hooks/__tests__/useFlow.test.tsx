import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useFlows, useFlow } from '../useFlow';

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

describe('useFlows', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches flow list', async () => {
    const mockFlows = [{ id: 'flow-1', name: 'Login Flow', stepCount: 4 }];
    vi.mocked(fetchApi).mockResolvedValueOnce(mockFlows);

    const { result } = renderHook(() => useFlows('repo-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockFlows);
  });
});

describe('useFlow', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches a single flow', async () => {
    const mockFlow = { id: 'flow-1', name: 'Login Flow', steps: [{ name: 'login', type: 'Function' }], source: 'test' };
    vi.mocked(fetchApi).mockResolvedValueOnce(mockFlow);

    const { result } = renderHook(() => useFlow('repo-1', 'flow-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockFlow);
  });
});
