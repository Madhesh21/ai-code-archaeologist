import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function GraphExplorer() {
  const { id } = useParams<{ id: string }>();

  const initialNodes: Node[] = useMemo(
    () => [
      {
        id: 'placeholder',
        type: 'input',
        position: { x: 250, y: 200 },
        data: { label: 'Repository' },
        style: {
          background: '#1e1b4b',
          color: '#a5b4fc',
          border: '1px solid #4338ca',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
        },
      },
    ],
    [],
  );

  const initialEdges: Edge[] = useMemo(() => [], []);

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
          <MiniMap
            style={{ background: '#111827' }}
            nodeColor="#4338ca"
            maskColor="rgba(17, 24, 39, 0.8)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
