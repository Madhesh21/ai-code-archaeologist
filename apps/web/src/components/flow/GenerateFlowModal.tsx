import { useState } from 'react';

interface GenerateFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (entityName: string) => void;
  isGenerating: boolean;
}

export default function GenerateFlowModal({ isOpen, onClose, onGenerate, isGenerating }: GenerateFlowModalProps) {
  const [entityName, setEntityName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entityName.trim()) {
      onGenerate(entityName.trim());
      setEntityName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-96 rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-200">Generate Flow</h3>
        <p className="mt-1 text-sm text-gray-500">
          Enter an entity name to trace its execution path (e.g. &quot;login&quot;, &quot;authentication&quot;).
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            placeholder="Entity name..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !entityName.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
