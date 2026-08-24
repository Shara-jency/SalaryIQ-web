import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, EmptyState } from "@shared/ui";
import { formatCurrency } from "@shared/utils/currency";
import { useCurrentProfile } from "@features/profile/hooks/useProfile";
import { useLatestSalaryEntry } from "@features/analyzer/hooks/useSalaryEntries";
import { useSalaryHistoryList, useSalaryHistoryMutations } from "./hooks/useSalaryHistory";
import { SalaryHistoryFormDialog } from "./components/SalaryHistoryFormDialog";
import type { SalaryHistoryEntry } from "@domain/models";

// Caps how far back the year-by-year template reaches even for someone with
// decades of experience — most people don't have (or care to log) salary
// history from 15+ years ago, and a huge list of placeholders isn't useful.
const MAX_TEMPLATE_YEARS = 5;

type DialogState = "closed" | { kind: "add"; year?: number } | { kind: "edit"; entry: SalaryHistoryEntry };

type TimelineRow = { year: number; entry: SalaryHistoryEntry } | { year: number; entry: null };

function GrowthBadge({ pct, vsYear }: { pct: number; vsYear: number | string }) {
  const isPositive = pct >= 0;
  return (
    <p className="mt-1 text-xs">
      <span className={`font-semibold ${isPositive ? "text-success" : "text-danger"}`}>
        {isPositive ? "+" : ""}
        {pct.toFixed(1)}%
      </span>{" "}
      <span className="text-text-light">vs {vsYear}</span>
    </p>
  );
}

export function HistoryPage() {
  const { profile } = useCurrentProfile();
  const { data: history = [] } = useSalaryHistoryList(profile?.id);
  const { data: latestEntry } = useLatestSalaryEntry(profile?.id);
  const { create, update, remove } = useSalaryHistoryMutations(profile?.id);
  const [dialogState, setDialogState] = useState<DialogState>("closed");

  const currentYear = new Date().getFullYear();
  const yearsBack = Math.min(Math.max(Math.floor(profile?.experienceYears ?? 0), 0), MAX_TEMPLATE_YEARS);
  const templateYears = Array.from({ length: yearsBack }, (_, i) => currentYear - yearsBack + i);

  const allYears = Array.from(new Set([...templateYears, ...history.map((e) => e.year)])).sort((a, b) => a - b);
  const rows: TimelineRow[] = allYears.map((year) => ({
    year,
    entry: history.find((e) => e.year === year) ?? null,
  }));

  // Growth is measured against the nearest *earlier* row that actually has
  // data, so a gap year with no entry (still a placeholder) doesn't break
  // the comparison for the row after it. Uses a plain loop (not .map) since
  // TS can't reliably narrow a `let` that's reassigned inside a callback.
  const rowsWithGrowth: { row: TimelineRow; growthPct: number | null; vsYear: number | null }[] = [];
  let previous: { year: number; ctc: number } | null = null;
  for (const row of rows) {
    if (!row.entry) {
      rowsWithGrowth.push({ row, growthPct: null, vsYear: null });
      continue;
    }
    const growthPct = previous ? ((row.entry.annualCtc - previous.ctc) / previous.ctc) * 100 : null;
    const vsYear = previous?.year ?? null;
    rowsWithGrowth.push({ row, growthPct, vsYear });
    previous = { year: row.year, ctc: row.entry.annualCtc };
  }
  const currentGrowthPct = latestEntry && previous ? ((latestEntry.annualCtc - previous.ctc) / previous.ctc) * 100 : null;
  const currentVsYear = previous?.year ?? null;

  const isEmpty = rowsWithGrowth.length === 0 && !latestEntry;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Salary History</h1>
        <Button onClick={() => setDialogState({ kind: "add" })}>+ Add entry</Button>
      </div>

      {isEmpty ? (
        <EmptyState title="No history logged yet" message="Manually log previous salaries to track earnings over time." />
      ) : (
        <div className="space-y-3">
          {rowsWithGrowth.map(({ row, growthPct, vsYear }) =>
            row.entry ? (
              <Card key={row.year} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {row.entry.year} {row.entry.jobTitle ? `• ${row.entry.jobTitle}` : ""}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {row.entry.company ? `${row.entry.company} • ` : ""}
                    {formatCurrency(row.entry.annualCtc)}
                    {row.entry.monthlyInHand ? ` • ${formatCurrency(row.entry.monthlyInHand)}/mo` : ""}
                  </p>
                  {row.entry.notes ? <p className="text-xs text-text-light">{row.entry.notes}</p> : null}
                  {growthPct !== null && vsYear !== null ? <GrowthBadge pct={growthPct} vsYear={vsYear} /> : null}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDialogState({ kind: "edit", entry: row.entry! })}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this entry?")) remove.mutate(row.entry!.id);
                    }}
                    className="text-sm text-danger hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ) : (
              <button
                key={row.year}
                onClick={() => setDialogState({ kind: "add", year: row.year })}
                className="flex w-full items-center justify-between rounded-2xl border border-dashed border-border bg-card p-5 text-left text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
              >
                <span>{row.year} — no entry yet</span>
                <span className="font-semibold">+ Add</span>
              </button>
            ),
          )}

          {latestEntry ? (
            <Card className="flex items-center justify-between border-primary bg-primary-light">
              <div>
                <p className="font-semibold text-primary">Current • {latestEntry.jobTitle}</p>
                <p className="text-xs text-primary">{formatCurrency(latestEntry.annualCtc)}</p>
                {currentGrowthPct !== null && currentVsYear !== null ? (
                  <GrowthBadge pct={currentGrowthPct} vsYear={currentVsYear} />
                ) : null}
              </div>
              <Link to="/analyzer" className="text-xs font-semibold text-primary hover:underline">
                Update via Analyzer
              </Link>
            </Card>
          ) : (
            <Link
              to="/analyzer"
              className="flex items-center justify-between rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              <span>Current — no analysis yet</span>
              <span className="font-semibold">Analyze now</span>
            </Link>
          )}
        </div>
      )}

      {dialogState !== "closed" && profile ? (
        <SalaryHistoryFormDialog
          profileId={profile.id}
          initial={dialogState.kind === "edit" ? dialogState.entry : undefined}
          initialYear={dialogState.kind === "add" ? dialogState.year : undefined}
          isSubmitting={create.isPending || update.isPending}
          onCancel={() => setDialogState("closed")}
          onSubmit={(input) => {
            if (dialogState.kind === "edit") {
              update.mutate({ id: dialogState.entry.id, patch: input }, { onSuccess: () => setDialogState("closed") });
            } else {
              create.mutate(input, { onSuccess: () => setDialogState("closed") });
            }
          }}
        />
      ) : null}
    </div>
  );
}
