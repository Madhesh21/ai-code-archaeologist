import type { FlowItem } from '@/types/api';

interface FlowListProps {
  flows: FlowItem[];
  activeFlowId: string | null;
  onSelect: (flowId: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function FlowList({ flows, activeFlowId, onSelect, onGenerate, isLoading }: FlowListProps) {
  return (
    <div className="w-72 rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Flows</h3>
        <button
          onClick={onGenerate}
          className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-500"
        >
          + Generate
        </button>
      </div>

      <div className="mt-3 space-y-1">
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-800" />
            ))}
          </div>
        )}

        {!isLoading && flows.length === 0 && (
          <p className="py-4 text-center text-xs text-gray-500">
            No flows found. Generate one to trace an execution path.
          </p>
        )}

        {flows.map((flow) => (
          <button
            key={flow.id}
            onClick={() => onSelect(flow.id)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              activeFlowId === flow.id
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <p className="font-medium">{flow.name}</p>
            <p className="text-xs text-gray-600">{flow.stepCount} steps</p>
          </button>
        ))}
      </div>
    </div>
  );
}
