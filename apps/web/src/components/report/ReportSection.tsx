import type { ReactNode } from 'react';

interface ReportSectionProps {
  title: string;
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
}

export default function ReportSection({
  title,
  children,
  loading,
  empty,
  emptyMessage = 'No data available',
}: ReportSectionProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-800" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-800" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-800" />
        </div>
      ) : empty ? (
        <p className="text-sm text-gray-600">{emptyMessage}</p>
      ) : (
        children
      )}
    </div>
  );
}
