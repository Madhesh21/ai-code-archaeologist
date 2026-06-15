import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFlows, useFlow, useGenerateFlow } from '@/hooks/useFlow';
import FlowList from '@/components/flow/FlowList';
import FlowCanvas from '@/components/flow/FlowCanvas';
import GenerateFlowModal from '@/components/flow/GenerateFlowModal';

export default function FlowExplorer() {
  const { id } = useParams<{ id: string }>();
  const { data: flows, isLoading: isFlowsLoading } = useFlows(id);
  const generateFlow = useGenerateFlow(id);

  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: activeFlow, isLoading: isFlowLoading } = useFlow(id, activeFlowId);

  const handleSelectFlow = (flowId: string) => {
    setActiveFlowId(flowId);
  };

  const handleGenerateFlow = (entityName: string) => {
    generateFlow.mutate(entityName, {
      onSuccess: (data) => {
        setIsModalOpen(false);
        setActiveFlowId(data.flowId);
      },
    });
  };

  return (
    <div className="flex h-full gap-4">
      <FlowList
        flows={flows || []}
        activeFlowId={activeFlowId}
        onSelect={handleSelectFlow}
        onGenerate={() => setIsModalOpen(true)}
        isLoading={isFlowsLoading}
      />

      <div className="flex flex-1 flex-col">
        {!activeFlowId && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-800 bg-gray-900">
            <p className="text-sm text-gray-500">Select a flow to view its execution path</p>
          </div>
        )}

        {activeFlowId && isFlowLoading && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-800 bg-gray-900">
            <p className="text-sm text-gray-500">Loading flow...</p>
          </div>
        )}

        {activeFlow && !isFlowLoading && (
          <>
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-200">{activeFlow.name}</p>
              <p className="text-xs text-gray-500">Source: {activeFlow.source}</p>
            </div>
            <FlowCanvas steps={activeFlow.steps} flowName={activeFlow.name} />
          </>
        )}
      </div>

      <GenerateFlowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateFlow}
        isGenerating={generateFlow.isPending}
      />
    </div>
  );
}
