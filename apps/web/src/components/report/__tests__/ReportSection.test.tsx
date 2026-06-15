import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportSection from '../ReportSection';

describe('ReportSection', () => {
  it('renders title and children', () => {
    render(<ReportSection title="Summary"><p>Content</p></ReportSection>);
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    const { container } = render(<ReportSection title="Summary" loading><p>Content</p></ReportSection>);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('shows empty message', () => {
    render(<ReportSection title="Summary" empty emptyMessage="Nothing here"><p>Content</p></ReportSection>);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});
