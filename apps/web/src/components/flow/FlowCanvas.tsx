import { useMemo } from 'react';
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FlowStepNode from './FlowStepNode';

const nodeTypes = { flowStep: FlowStepNode };

interface FlowCanvasProps {
  steps: Array<{ name: string; type: string }>;
  flowName: string;
}

export default function FlowCanvas({ steps }: FlowCanvasProps) {
  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = steps.map((step, i) => ({
      id: `step-${i}`,
      type: 'flowStep',
      position: { x: 200, y: i * 120 + 20 },
      data: { label: step.name, stepType: step.type },
    }));

    const flowEdges: Edge[] = steps.slice(0, -1).map((_, i) => ({
      id: `e-${i}-${i + 1}`,
      source: `step-${i}`,
      target: `step-${i + 1}`,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [steps]);

  return (
    <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#374151" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
