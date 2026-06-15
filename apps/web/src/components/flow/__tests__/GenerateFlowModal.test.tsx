import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GenerateFlowModal from '../GenerateFlowModal';

describe('GenerateFlowModal', () => {
  it('renders when open', () => {
    render(
      <GenerateFlowModal isOpen={true} onClose={vi.fn()} onGenerate={vi.fn()} isGenerating={false} />
    );
    expect(screen.getByText('Generate Flow')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Entity name...')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <GenerateFlowModal isOpen={false} onClose={vi.fn()} onGenerate={vi.fn()} isGenerating={false} />
    );
    expect(screen.queryByText('Generate Flow')).not.toBeInTheDocument();
  });

  it('calls onGenerate with entity name', () => {
    const onGenerate = vi.fn();
    render(
      <GenerateFlowModal isOpen={true} onClose={vi.fn()} onGenerate={onGenerate} isGenerating={false} />
    );
    const input = screen.getByPlaceholderText('Entity name...');
    fireEvent.change(input, { target: { value: 'login' } });
    fireEvent.click(screen.getByText('Generate'));
    expect(onGenerate).toHaveBeenCalledWith('login');
  });
});
