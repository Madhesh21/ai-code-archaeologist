import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/api/v1';

async function fetchJson(url: string) {
  const res = await fetch(url);
  const body = await res.json();
  if (!body.success) throw new Error(body.error?.message ?? 'Request failed');
  return body.data;
}

async function postJson(url: string) {
  const res = await fetch(url, { method: 'POST' });
  const body = await res.json();
  if (!body.success) throw new Error(body.error?.message ?? 'Request failed');
  return body.data;
}

export default function RepositoryOverview() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const repoQuery = useQuery({
    queryKey: ['repository', id],
    queryFn: () => fetchJson(`${API_BASE}/repositories/${id}`),
    enabled: !!id,
  });

  const treeQuery = useQuery({
    queryKey: ['repository-tree', id],
    queryFn: () => fetchJson(`${API_BASE}/repositories/${id}/tree`),
    enabled: !!id,
    retry: false,
  });

  const scanMutation = useMutation({
    mutationFn: () => postJson(`${API_BASE}/repositories/${id}/scan`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repository', id] });
      queryClient.invalidateQueries({ queryKey: ['repository-tree', id] });
    },
  });

  const repo = repoQuery.data;
  const tree = treeQuery.data;

  const detailSections = [
    { label: 'Status', value: repo?.status ?? '—' },
    { label: 'Source', value: repo?.sourceType ?? '—' },
    { label: 'Files', value: tree ? String(tree.files.length) : '—' },
    { label: 'Folders', value: tree ? String(tree.folders.length) : '—' },
    { label: 'Analyzed', value: tree ? new Date(tree.scannedAt).toLocaleDateString() : '—' },
  ];

  const quickLinks = [
    { to: 'chat', label: 'Chat', description: 'Ask questions about this repository' },
    { to: 'graph', label: 'Graph', description: 'Explore the knowledge graph' },
    { to: 'flow', label: 'Flows', description: 'View execution flows' },
    { to: 'report', label: 'Report', description: 'View archaeological report' },
  ];

  const displayTree = tree?.folders?.slice(0, 20) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Repository Overview</h2>
          <p className="mt-1 font-mono text-sm text-gray-500">ID: {id}</p>
        </div>
        <button
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {scanMutation.isPending ? 'Scanning...' : 'Scan Repository'}
        </button>
      </div>

      {scanMutation.isError && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
          Scan failed: {(scanMutation.error as Error).message}
        </div>
      )}

      {repoQuery.isLoading && (
        <div className="text-sm text-gray-500">Loading repository...</div>
      )}

      {repoQuery.isError && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
          Failed to load repository: {(repoQuery.error as Error).message}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {detailSections.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-sm font-medium text-gray-200">{s.value}</p>
          </div>
        ))}
      </div>

      {tree && displayTree.length > 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-300">Folder Structure</h3>
          <div className="space-y-1">
            {displayTree.map((folder: { path: string }) => (
              <div key={folder.path} className="font-mono text-xs text-gray-400">
                📁 {folder.path}/
              </div>
            ))}
            {tree.folders.length > 20 && (
              <div className="text-xs text-gray-600">
                ...and {tree.folders.length - 20} more folders
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
          >
            <h3 className="font-semibold text-indigo-400">{link.label}</h3>
            <p className="mt-1 text-sm text-gray-400">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
