import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/api/client';
import type { ReportData } from '@/types/api';

export function useReport(id: string | undefined) {
  return useQuery<ReportData>({
    queryKey: ['report', id],
    queryFn: () => fetchApi<ReportData>(`/repositories/${id}/report`),
    enabled: !!id,
  });
}

export function useRegenerateReport(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchApi<void>(`/repositories/${id}/report/regenerate`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
  });
}
