import { useState, useEffect, useRef } from 'react';
import type { GraphNode } from '@/types/api';

interface GraphSearchProps {
  onSearch: (query: string) => void;
  results: GraphNode[];
  isSearching: boolean;
  onSelect: (node: GraphNode) => void;
}

export default function GraphSearch({ onSearch, results, isSearching, onSelect }: GraphSearchProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, onSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Search nodes..."
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
      />
      {showDropdown && (results.length > 0 || isSearching) && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
          {isSearching && (
            <div className="p-2 text-xs text-gray-500">Searching...</div>
          )}
          {results.map((node) => (
            <button
              key={node.id}
              onMouseDown={() => { onSelect(node); setShowDropdown(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
            >
              <span className="text-xs text-gray-500">{node.type}</span>
              <span>{node.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
