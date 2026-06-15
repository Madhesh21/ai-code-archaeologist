import { useParams } from 'react-router-dom';
import { useReport, useRegenerateReport } from '@/hooks/useReport';
import ReportSection from '@/components/report/ReportSection';
import TechBadge from '@/components/report/TechBadge';

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-400',
  POST: 'text-blue-400',
  PUT: 'text-orange-400',
  PATCH: 'text-orange-400',
  DELETE: 'text-red-400',
};

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, isError, error } = useReport(id);
  const regenerate = useRegenerateReport(id);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm text-red-400">{(error as Error).message}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report && isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg border border-gray-800 bg-gray-900" />
        ))}
      </div>
    );
  }

  const isEmpty = report && !report.executiveSummary && !report.technologySummary;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Archaeological Report</h2>
        <button
          onClick={() => regenerate.mutate()}
          disabled={regenerate.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {regenerate.isPending ? 'Regenerating...' : 'Regenerate Report'}
        </button>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 py-20">
          <p className="text-sm text-gray-500">Report not yet generated. Run analysis first.</p>
        </div>
      ) : (
        <>
          <ReportSection title="Executive Summary" loading={isLoading} empty={!report?.executiveSummary}>
            <p className="text-sm leading-relaxed text-gray-300">{report?.executiveSummary}</p>
          </ReportSection>

          <ReportSection
            title="Technology Stack"
            loading={isLoading}
            empty={!report?.technologySummary}
          >
            {report?.technologySummary && (
              <div className="space-y-3">
                {(['frontend', 'backend', 'database', 'infrastructure'] as const).map((category) => {
                  const techs = report.technologySummary[category];
                  if (!techs || techs.length === 0) return null;
                  return (
                    <div key={category}>
                      <p className="mb-2 text-xs font-medium capitalize text-gray-500">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {techs.map((tech) => (
                          <TechBadge key={tech} name={tech} category={category} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ReportSection>

          <ReportSection
            title="API Inventory"
            loading={isLoading}
            empty={!report?.apiInventory || report.apiInventory.length === 0}
          >
            {report?.apiInventory && report.apiInventory.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                      <th className="pb-2 pr-4 font-medium">Method</th>
                      <th className="pb-2 pr-4 font-medium">Path</th>
                      <th className="pb-2 font-medium">Controller</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.apiInventory.map((api, i) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        <td className="py-2 pr-4">
                          <span className={`font-mono text-xs font-bold ${METHOD_COLORS[api.method] || 'text-gray-400'}`}>
                            {api.method}
                          </span>
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs text-gray-300">{api.path}</td>
                        <td className="py-2 text-xs text-gray-400">{api.controller}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ReportSection>

          <ReportSection
            title="Model Inventory"
            loading={isLoading}
            empty={!report?.modelInventory || report.modelInventory.length === 0}
          >
            {report?.modelInventory && report.modelInventory.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                      <th className="pb-2 pr-4 font-medium">Model Name</th>
                      <th className="pb-2 pr-4 font-medium">Fields</th>
                      <th className="pb-2 font-medium">Collection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.modelInventory.map((model, i) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        <td className="py-2 pr-4 text-xs text-gray-300">{model.name}</td>
                        <td className="py-2 pr-4 text-xs text-gray-400">{model.fields}</td>
                        <td className="py-2 font-mono text-xs text-gray-400">{model.collection}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ReportSection>

          <ReportSection
            title="Dependency Overview"
            loading={isLoading}
            empty={!report?.dependencyOverview || report.dependencyOverview.length === 0}
          >
            {report?.dependencyOverview && report.dependencyOverview.length > 0 && (
              <div className="space-y-3">
                {report.dependencyOverview.map((dep, i) => (
                  <div key={i}>
                    <span className="text-sm font-medium text-gray-300">{dep.source}</span>
                    <span className="text-sm text-gray-500"> depends on: </span>
                    {dep.targets.map((target, j) => (
                      <span key={j}>
                        <span className="text-sm text-indigo-400">{target}</span>
                        {j < dep.targets.length - 1 && <span className="text-gray-600">, </span>}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </ReportSection>
        </>
      )}
    </div>
  );
}
