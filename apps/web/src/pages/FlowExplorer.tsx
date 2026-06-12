import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function FlowExplorer() {
  const { id } = useParams<{ id: string }>();

  const initialNodes: Node[] = useMemo(
    () => [
      {
        id: 'start',
        type: 'input',
        position: { x: 250, y: 50 },
        data: { label: 'Start' },
        style: {
          background: '#1e1b4b',
          color: '#a5b4fc',
          border: '1px solid #4338ca',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
        },
      },
      {
        id: 'end',
        type: 'output',
        position: { x: 250, y: 350 },
        data: { label: 'End' },
        style: {
          background: '#312e81',
          color: '#c7d2fe',
          border: '1px solid #6366f1',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
        },
      },
    ],
    [],
  );

  const initialEdges: Edge[] = useMemo(
    () => [
      {
        id: 'e-start-end',
        source: 'start',
        target: 'end',
        animated: true,
        style: { stroke: '#6366f1' },
      },
    ],
    [],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <p className="font-mono text-xs text-gray-500">Repository: {id}</p>
      </div>
      <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#374151" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
