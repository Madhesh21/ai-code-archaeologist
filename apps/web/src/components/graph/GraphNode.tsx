import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { GraphNodeType } from '@/types/api';

const NODE_COLORS: Record<GraphNodeType, string> = {
  Function: '#3b82f6',
  Class: '#22c55e',
  Interface: '#14b8a6',
  Type: '#14b8a6',
  Enum: '#f59e0b',
  Service: '#8b5cf6',
  Middleware: '#f97316',
  Component: '#ec4899',
  Hook: '#06b6d4',
  Route: '#f97316',
  Model: '#a855f7',
  File: '#6b7280',
  Folder: '#9ca3af',
  Repository: '#6366f1',
};

function GraphNode({ data }: NodeProps) {
  const nodeType = data.nodeType as GraphNodeType;
  const color = NODE_COLORS[nodeType] || '#6b7280';

  return (
    <div
      className="rounded-lg border-2 px-4 py-2 shadow-lg"
      style={{
        background: `${color}15`,
        borderColor: color,
        color: '#e5e7eb',
        minWidth: 120,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <div>
          <p className="text-xs font-medium leading-tight">{data.label as string}</p>
          <p className="text-[10px] leading-tight" style={{ color: `${color}cc` }}>
            {nodeType}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color }} />
    </div>
  );
}

export default memo(GraphNode);
