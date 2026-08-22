import { Card, EmptyState, StatTile } from "@shared/ui";
import { formatCurrency } from "@shared/utils/currency";
import { useReports } from "./hooks/useReports";

export function ReportsPage() {
  const { summary, isLoading } = useReports();

  if (isLoading) return null;

  if (summary.savedCount === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Reports</h1>
        <EmptyState title="No saved analyses yet" message="Save a self-analysis to see aggregate reports here." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reports</h1>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Saved analyses" value={String(summary.savedCount)} />
        <StatTile label="Average CTC" value={formatCurrency(summary.averageCtc)} />
        <StatTile label="Highest CTC" value={formatCurrency(summary.highestCtc)} />
        <StatTile label="Avg. monthly in-hand" value={formatCurrency(summary.averageMonthlyInHand)} />
      </div>

      <p className="mb-4 text-sm text-text-secondary">{summary.distinctRoles} distinct role(s) tracked</p>

      <h2 className="mb-3 text-sm font-bold">Recent saved analyses</h2>
      <div className="space-y-3">
        {summary.recent.map((entry) => (
          <Card key={entry.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{entry.jobTitle}</p>
              <p className="text-xs text-text-secondary">
                {entry.city} • {formatCurrency(entry.annualCtc)}
              </p>
            </div>
            <p className="text-xs text-text-light">{new Date(entry.createdAt).toLocaleDateString("en-IN")}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
