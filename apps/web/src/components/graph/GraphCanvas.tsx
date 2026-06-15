import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import GraphNode from './GraphNode';

const nodeTypes = { graphNode: GraphNode };

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (_event: React.MouseEvent, _node: Node) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
}

export default function GraphCanvas({
  nodes,
  edges,
  onNodeClick,
  onNodesChange,
  onEdgesChange,
}: GraphCanvasProps) {
  const defaultEdgeOptions = { style: { stroke: '#4b5563', strokeWidth: 1.5 } };

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick(_event, node);
    },
    [onNodeClick],
  );

  return (
    <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={defaultEdgeOptions}
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
  );
}

export { nodeTypes };
