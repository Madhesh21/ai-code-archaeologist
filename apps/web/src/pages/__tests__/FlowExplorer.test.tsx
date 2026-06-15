import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import FlowExplorer from '../FlowExplorer';

vi.mock('@/hooks/useFlow', () => ({
  useFlows: vi.fn(),
  useFlow: vi.fn(),
  useGenerateFlow: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

import { useFlows, useFlow } from '@/hooks/useFlow';

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/repositories/repo-1/flow']}>
        <Routes>
          <Route path="/repositories/:id/flow" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('FlowExplorer', () => {
  it('shows select a flow message when no flow selected', () => {
    vi.mocked(useFlows).mockReturnValue({ data: [], isLoading: false } as any);
    vi.mocked(useFlow).mockReturnValue({ data: undefined, isLoading: false } as any);

    renderWithProviders(<FlowExplorer />);
    expect(screen.getByText(/Select a flow/)).toBeInTheDocument();
  });

  it('shows flow list', () => {
    vi.mocked(useFlows).mockReturnValue({
      data: [{ id: 'f1', name: 'Login Flow', stepCount: 4 }],
      isLoading: false,
    } as any);
    vi.mocked(useFlow).mockReturnValue({ data: undefined, isLoading: false } as any);

    renderWithProviders(<FlowExplorer />);
    expect(screen.getByText('Login Flow')).toBeInTheDocument();
  });
});
