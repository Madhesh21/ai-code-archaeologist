import { useParams, Link } from 'react-router-dom';

const detailSections = [
  { label: 'Status', value: '—' },
  { label: 'Source', value: '—' },
  { label: 'Files', value: '—' },
  { label: 'Entities', value: '—' },
  { label: 'Relationships', value: '—' },
  { label: 'Analyzed', value: '—' },
];

const quickLinks = [
  { to: 'chat', label: 'Chat', description: 'Ask questions about this repository' },
  { to: 'graph', label: 'Graph', description: 'Explore the knowledge graph' },
  { to: 'flow', label: 'Flows', description: 'View execution flows' },
];

export default function RepositoryOverview() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">Repository Overview</h2>
        <p className="mt-1 font-mono text-sm text-gray-500">ID: {id}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {detailSections.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-gray-800 bg-gray-900 p-4"
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-sm font-medium text-gray-200">{s.value}</p>
          </div>
        ))}
      </div>

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
