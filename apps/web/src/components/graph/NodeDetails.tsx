import type { GraphNode, GraphRelationship } from '@/types/api';

interface NodeDetailsProps {
  node: GraphNode | null;
  relationships: GraphRelationship[];
  onClose: () => void;
}

export default function NodeDetails({ node, relationships, onClose }: NodeDetailsProps) {
  if (!node) return null;

  return (
    <div className="w-72 rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">{node.name}</h3>
        <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-300">
          Close
        </button>
      </div>
      <div className="mt-3 space-y-2 text-xs">
        <div>
          <span className="text-gray-500">Type:</span>
          <span className="ml-2 text-gray-300">{node.type}</span>
        </div>
        {node.filePath && (
          <div>
            <span className="text-gray-500">File:</span>
            <span className="ml-2 font-mono text-gray-300">{node.filePath}</span>
          </div>
        )}
        <div>
          <span className="text-gray-500">Relationships:</span>
          <span className="ml-2 text-gray-300">{relationships.length}</span>
        </div>
      </div>
      {relationships.length > 0 && (
        <div className="mt-3 border-t border-gray-800 pt-3">
          <p className="mb-2 text-xs font-medium text-gray-400">Connected to:</p>
          <div className="space-y-1">
            {relationships.slice(0, 10).map((rel, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">{rel.type}</span>
                <span className="text-gray-300">{rel.targetName || rel.targetId}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
