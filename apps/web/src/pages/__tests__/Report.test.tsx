import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import Report from '../Report';

vi.mock('@/hooks/useReport', () => ({
  useReport: vi.fn(),
  useRegenerateReport: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

import { useReport } from '@/hooks/useReport';

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/repositories/repo-1/report']}>
        <Routes>
          <Route path="/repositories/:id/report" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Report', () => {
  it('shows loading state', () => {
    vi.mocked(useReport).mockReturnValue({ data: undefined, isLoading: true, isError: false } as any);

    const { container } = renderWithProviders(<Report />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows report content', () => {
    vi.mocked(useReport).mockReturnValue({
      data: {
        executiveSummary: 'Test summary',
        technologySummary: { frontend: ['React'], backend: ['Express'], database: [], infrastructure: [] },
        apiInventory: [{ method: 'GET', path: '/api/login', controller: 'AuthController' }],
        modelInventory: [{ name: 'User', fields: 5, collection: 'users' }],
        dependencyOverview: [{ source: 'AuthService', targets: ['UserModel'] }],
      },
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(<Report />);
    expect(screen.getByText('Test summary')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('AuthService')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useReport).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
    } as any);

    renderWithProviders(<Report />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});
