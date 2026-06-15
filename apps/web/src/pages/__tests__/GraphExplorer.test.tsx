import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import GraphExplorer from '../GraphExplorer';

vi.mock('@/hooks/useGraph', () => ({
  useGraphSummary: vi.fn(),
  useNodeRelationships: vi.fn(() => ({ data: undefined, isLoading: false })),
  useSearchNodes: vi.fn(() => ({ data: [], isLoading: false })),
}));

import { useGraphSummary } from '@/hooks/useGraph';

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/repositories/repo-1/graph']}>
        <Routes>
          <Route path="/repositories/:id/graph" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('GraphExplorer', () => {
  it('shows empty state with search message', () => {
    vi.mocked(useGraphSummary).mockReturnValue({ data: undefined, isLoading: false, isError: false } as any);

    renderWithProviders(<GraphExplorer />);
    expect(screen.getByText(/Search for nodes/)).toBeInTheDocument();
  });
});
