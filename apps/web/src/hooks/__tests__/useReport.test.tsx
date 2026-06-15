import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useReport } from '../useReport';

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

describe('useReport', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches report data', async () => {
    const mockReport = {
      executiveSummary: 'Summary',
      technologySummary: { frontend: ['React'], backend: [], database: [], infrastructure: [] },
      apiInventory: [],
      modelInventory: [],
      dependencyOverview: [],
    };
    vi.mocked(fetchApi).mockResolvedValueOnce(mockReport);

    const { result } = renderHook(() => useReport('repo-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockReport);
  });
});
