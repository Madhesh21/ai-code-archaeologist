import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GraphSearch from '../GraphSearch';
import type { GraphNode } from '@/types/api';

const mockResults: GraphNode[] = [
  { id: '1', type: 'Function', name: 'login' },
  { id: '2', type: 'Class', name: 'AuthService' },
];

describe('GraphSearch', () => {
  it('renders search input', () => {
    render(
      <GraphSearch onSearch={vi.fn()} results={[]} isSearching={false} onSelect={vi.fn()} />
    );
    expect(screen.getByPlaceholderText('Search nodes...')).toBeInTheDocument();
  });

  it('shows dropdown with results', () => {
    render(
      <GraphSearch onSearch={vi.fn()} results={mockResults} isSearching={false} onSelect={vi.fn()} />
    );
    const input = screen.getByPlaceholderText('Search nodes...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'login' } });
    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.getByText('AuthService')).toBeInTheDocument();
  });
});
