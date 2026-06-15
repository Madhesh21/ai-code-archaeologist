import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/api/client';
import type { GraphSummary, GraphNode, GraphRelationship } from '@/types/api';

export function useGraphSummary(id: string | undefined) {
  return useQuery<GraphSummary>({
    queryKey: ['graph-summary', id],
    queryFn: () => fetchApi<GraphSummary>(`/repositories/${id}/graph`),
    enabled: !!id,
  });
}

export function useNodeRelationships(id: string | undefined, nodeId: string | null) {
  return useQuery<GraphRelationship[]>({
    queryKey: ['node-relationships', id, nodeId],
    queryFn: () => fetchApi<GraphRelationship[]>(`/repositories/${id}/graph/nodes/${nodeId}/relationships`),
    enabled: !!id && !!nodeId,
  });
}

export function useSearchNodes(id: string | undefined, query: string) {
  return useQuery<GraphNode[]>({
    queryKey: ['search-nodes', id, query],
    queryFn: () => fetchApi<GraphNode[]>(`/repositories/${id}/graph/search?q=${encodeURIComponent(query)}`),
    enabled: !!id && query.length > 0,
  });
}
