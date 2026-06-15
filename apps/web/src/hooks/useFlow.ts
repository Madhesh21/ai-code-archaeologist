import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/api/client';
import type { FlowItem, FlowDetail } from '@/types/api';

export function useFlows(id: string | undefined) {
  return useQuery<FlowItem[]>({
    queryKey: ['flows', id],
    queryFn: () => fetchApi<FlowItem[]>(`/repositories/${id}/flows`),
    enabled: !!id,
  });
}

export function useFlow(id: string | undefined, flowId: string | null) {
  return useQuery<FlowDetail>({
    queryKey: ['flow', id, flowId],
    queryFn: () => fetchApi<FlowDetail>(`/repositories/${id}/flows/${flowId}`),
    enabled: !!id && !!flowId,
  });
}

export function useGenerateFlow(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entityName: string) =>
      fetchApi<{ flowId: string }>(`/repositories/${id}/flows/generate`, {
        method: 'POST',
        body: JSON.stringify({ entityName }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows', id] });
    },
  });
}
