import { useState } from "react";
import { Badge, Button, Card, EmptyState, StatTile } from "@shared/ui";
import { formatCurrency } from "@shared/utils/currency";
import { useCurrentProfile } from "@features/profile/hooks/useProfile";
import { useDeleteSalaryEntry } from "@features/analyzer/hooks/useSalaryEntries";
import { useReports } from "./hooks/useReports";
import type { SalaryEntry } from "@domain/models";

const COMPANY_TIER_LABELS: Record<SalaryEntry["companyTier"], string> = {
  tier1: "Tier 1",
  tier2: "Tier 2",
  tier3: "Tier 3",
};

export function ReportsPage() {
  const { profile } = useCurrentProfile();
  const { summary, isLoading } = useReports();
  const deleteEntry = useDeleteSalaryEntry(profile?.id);
  const [openEntry, setOpenEntry] = useState<SalaryEntry | null>(null);

  const handleDelete = (entry: SalaryEntry) => {
    if (!confirm("Delete this saved analysis?")) return;
    deleteEntry.mutate(entry.id, { onSuccess: () => setOpenEntry(null) });
  };

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

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Saved analyses" value={String(summary.savedCount)} />
        <StatTile label="Highest CTC" value={formatCurrency(summary.highestCtc)} />
        <StatTile label="Avg. monthly in-hand" value={formatCurrency(summary.averageMonthlyInHand)} />
      </div>

      <p className="mb-4 text-sm text-text-secondary">{summary.distinctRoles} distinct role(s) tracked</p>

      <h2 className="mb-3 text-sm font-bold">Recent saved analyses</h2>
      <div className="space-y-3">
        {summary.recent.map((entry) => (
          <Card
            key={entry.id}
            onClick={() => setOpenEntry(entry)}
            className="flex cursor-pointer items-center justify-between transition-colors hover:border-primary"
          >
            <div>
              <p className="font-semibold">{entry.jobTitle}</p>
              <p className="text-xs text-text-secondary">
                {entry.city} • {formatCurrency(entry.annualCtc)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-text-light">{new Date(entry.createdAt).toLocaleDateString("en-IN")}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(entry);
                }}
                className="text-xs font-semibold text-danger hover:underline"
              >
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      {openEntry ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpenEntry(null)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{openEntry.jobTitle}</h2>
              <Badge>{COMPANY_TIER_LABELS[openEntry.companyTier]}</Badge>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <StatTile label="Annual CTC" value={formatCurrency(openEntry.annualCtc)} />
              <StatTile label="Monthly in-hand" value={formatCurrency(openEntry.monthlyInHand)} />
              <StatTile label="Annual tax" value={formatCurrency(openEntry.annualTax)} />
              <StatTile label="Experience" value={`${openEntry.experienceYears} yrs`} />
            </div>

            <div className="mb-4 space-y-1 text-sm text-text-secondary">
              <p>City: {openEntry.city}</p>
              <p>Industry: {openEntry.industry}</p>
              <p>Tax regime: {openEntry.taxRegime === "new" ? "New regime" : "Old regime"}</p>
              <p>Saved on: {new Date(openEntry.createdAt).toLocaleDateString("en-IN")}</p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setOpenEntry(null)}>
                Close
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={deleteEntry.isPending}
                onClick={() => handleDelete(openEntry)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
