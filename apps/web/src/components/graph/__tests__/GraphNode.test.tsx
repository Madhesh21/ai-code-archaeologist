import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { ReactNode } from 'react';
import GraphNode from '../GraphNode';

const baseNodeProps = {
  id: '1',
  type: 'graphNode' as const,
  selected: false,
  zIndex: 0,
  isConnectable: true,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  dragging: false,
  selectable: true,
  deletable: true,
  draggable: true,
  data: { label: 'login', nodeType: 'Function' },
};

function renderWithFlow(ui: ReactNode) {
  return render(<ReactFlowProvider>{ui}</ReactFlowProvider>);
}

describe('GraphNode', () => {
  it('renders node name and type', () => {
    renderWithFlow(<GraphNode {...baseNodeProps} />);
    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.getByText('Function')).toBeInTheDocument();
  });
});
