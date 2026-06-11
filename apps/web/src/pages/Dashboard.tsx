import { Link } from 'react-router-dom';

const stats = [
  { label: 'Repositories', value: '0' },
  { label: 'Entities Found', value: '0' },
  { label: 'Relationships', value: '0' },
  { label: 'Flows Mapped', value: '0' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">Welcome to Codebase Archaeologist</h2>
        <p className="mt-1 text-gray-400">
          Upload a repository to analyze its architecture, dependencies, and flows.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-800 bg-gray-900 p-4"
          >
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-100">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-100">Recent Repositories</h3>
          <Link
            to="/upload"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Upload Repository
          </Link>
        </div>
        <div className="mt-6 rounded-lg border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-500">No repositories analyzed yet.</p>
          <p className="mt-1 text-sm text-gray-600">
            Upload a ZIP file or provide a GitHub URL to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
