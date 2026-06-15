import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { useGraphSummary, useNodeRelationships, useSearchNodes } from '@/hooks/useGraph';
import type { GraphNode } from '@/types/api';
import GraphCanvas from '@/components/graph/GraphCanvas';
import GraphSearch from '@/components/graph/GraphSearch';
import NodeDetails from '@/components/graph/NodeDetails';

export default function GraphExplorer() {
  const { id } = useParams<{ id: string }>();
  const { data: summary } = useGraphSummary(id);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandNodeId, setExpandNodeId] = useState<string | null>(null);

  const { data: searchResults, isLoading: isSearching } = useSearchNodes(
    id,
    searchQuery,
  );

  const { data: nodeRelationships } = useNodeRelationships(id, expandNodeId);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectNode = useCallback((graphNode: GraphNode) => {
    const newNode: Node = {
      id: graphNode.id,
      type: 'graphNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: graphNode.name, nodeType: graphNode.type },
    };
    setNodes((nds) => {
      if (nds.find((n) => n.id === newNode.id)) return nds;
      return [...nds, newNode];
    });
    setSelectedNode(graphNode);
    setExpandNodeId(graphNode.id);
  }, []);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const graphNode: GraphNode = {
        id: node.id,
        type: node.data.nodeType as GraphNode['type'],
        name: node.data.label as string,
      };
      setSelectedNode(graphNode);
      setExpandNodeId(node.id);
    },
    [],
  );

  const addedEdges = useMemo(() => {
    if (!nodeRelationships || !expandNodeId) return edges;
    const newEdges: Edge[] = nodeRelationships.map((rel, i) => ({
      id: `${expandNodeId}-${rel.targetId}-${i}`,
      source: expandNodeId,
      target: rel.targetId,
      label: rel.type,
      style: { stroke: '#6366f1' },
      animated: true,
    }));
    const existingIds = new Set(edges.map((e) => e.id));
    const unique = newEdges.filter((e) => !existingIds.has(e.id));
    if (unique.length === 0) return edges;

    const targetNodeIds = unique.map((e) => e.target);
    const newNodes: Node[] = targetNodeIds
      .filter((tid) => !nodes.find((n) => n.id === tid))
      .map((tid, i) => {
        const rel = nodeRelationships.find((r) => r.targetId === tid);
        return {
          id: tid,
          type: 'graphNode',
          position: { x: 200 + i * 180, y: 300 + Math.floor(i / 3) * 150 },
          data: { label: rel?.targetName || tid, nodeType: rel?.targetType || 'File' },
        };
      });

    setNodes((nds) => [...nds, ...newNodes]);
    return [...edges, ...unique];
  }, [nodeRelationships, expandNodeId, edges, nodes]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="max-w-md flex-1">
          <GraphSearch
            onSearch={handleSearch}
            results={searchResults || []}
            isSearching={isSearching}
            onSelect={handleSelectNode}
          />
        </div>
        {summary && (
          <p className="text-xs text-gray-500">
            {summary.nodes} nodes · {summary.relationships} relationships
          </p>
        )}
      </div>

      <div className="flex flex-1 gap-4">
        <div className="flex flex-1 flex-col">
          {nodes.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-800 bg-gray-900">
              <p className="text-sm text-gray-500">
                {id ? 'Search for nodes or click a node to explore the graph' : 'Select a repository to explore'}
              </p>
            </div>
          ) : (
            <GraphCanvas
              nodes={nodes}
              edges={addedEdges}
              onNodeClick={handleNodeClick}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
            />
          )}
        </div>

        {selectedNode && (
          <NodeDetails
            node={selectedNode}
            relationships={nodeRelationships || []}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
