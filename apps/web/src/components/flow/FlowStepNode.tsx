import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const STEP_COLORS: Record<string, string> = {
  Function: '#3b82f6',
  Class: '#22c55e',
  Route: '#f97316',
  Model: '#a855f7',
  Service: '#8b5cf6',
  Middleware: '#f97316',
  Component: '#ec4899',
  File: '#6b7280',
};

function FlowStepNode({ data }: NodeProps) {
  const color = STEP_COLORS[data.stepType as string] || '#6b7280';

  return (
    <div
      className="rounded-lg border-2 px-4 py-3 shadow-lg"
      style={{
        background: `${color}15`,
        borderColor: color,
        color: '#e5e7eb',
        minWidth: 140,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      <div className="text-center">
        <p className="text-sm font-medium">{data.label as string}</p>
        <p className="text-[10px] leading-tight" style={{ color: `${color}cc` }}>
          {data.stepType as string}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color }} />
    </div>
  );
}

export default memo(FlowStepNode);
