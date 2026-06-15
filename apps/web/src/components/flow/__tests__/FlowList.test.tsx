import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FlowList from '../FlowList';

const mockFlows = [
  { id: 'f1', name: 'Login Flow', stepCount: 4 },
  { id: 'f2', name: 'Signup Flow', stepCount: 3 },
];

describe('FlowList', () => {
  it('renders flow list', () => {
    render(
      <FlowList flows={mockFlows} activeFlowId={null} onSelect={vi.fn()} onGenerate={vi.fn()} isLoading={false} />
    );
    expect(screen.getByText('Login Flow')).toBeInTheDocument();
    expect(screen.getByText('Signup Flow')).toBeInTheDocument();
  });

  it('shows empty message when no flows', () => {
    render(
      <FlowList flows={[]} activeFlowId={null} onSelect={vi.fn()} onGenerate={vi.fn()} isLoading={false} />
    );
    expect(screen.getByText(/No flows found/)).toBeInTheDocument();
  });

  it('calls onSelect when flow clicked', () => {
    const onSelect = vi.fn();
    render(
      <FlowList flows={mockFlows} activeFlowId={null} onSelect={onSelect} onGenerate={vi.fn()} isLoading={false} />
    );
    fireEvent.click(screen.getByText('Login Flow'));
    expect(onSelect).toHaveBeenCalledWith('f1');
  });
});
