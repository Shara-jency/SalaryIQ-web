import { useState } from "react";
import { Button, Card, EmptyState } from "@shared/ui";
import { formatCurrency } from "@shared/utils/currency";
import { useCurrentProfile } from "@features/profile/hooks/useProfile";
import { useSalaryHistoryList, useSalaryHistoryMutations } from "./hooks/useSalaryHistory";
import { SalaryHistoryFormDialog } from "./components/SalaryHistoryFormDialog";
import type { SalaryHistoryEntry } from "@domain/models";

export function HistoryPage() {
  const { profile } = useCurrentProfile();
  const { data: history = [] } = useSalaryHistoryList(profile?.id);
  const { create, update, remove } = useSalaryHistoryMutations(profile?.id);
  const [dialogState, setDialogState] = useState<"closed" | "add" | SalaryHistoryEntry>("closed");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Salary History</h1>
        <Button onClick={() => setDialogState("add")}>+ Add entry</Button>
      </div>

      {history.length === 0 ? (
        <EmptyState title="No history logged yet" message="Manually log previous salaries to track earnings over time." />
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <Card key={entry.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {entry.year} {entry.jobTitle ? `• ${entry.jobTitle}` : ""}
                </p>
                <p className="text-xs text-text-secondary">
                  {entry.company ? `${entry.company} • ` : ""}
                  {formatCurrency(entry.annualCtc)}
                  {entry.monthlyInHand ? ` • ${formatCurrency(entry.monthlyInHand)}/mo` : ""}
                </p>
                {entry.notes ? <p className="text-xs text-text-light">{entry.notes}</p> : null}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDialogState(entry)} className="text-sm text-primary hover:underline">
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this entry?")) remove.mutate(entry.id);
                  }}
                  className="text-sm text-danger hover:underline"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {dialogState !== "closed" && profile ? (
        <SalaryHistoryFormDialog
          profileId={profile.id}
          initial={dialogState === "add" ? undefined : dialogState}
          isSubmitting={create.isPending || update.isPending}
          onCancel={() => setDialogState("closed")}
          onSubmit={(input) => {
            if (dialogState === "add") {
              create.mutate(input, { onSuccess: () => setDialogState("closed") });
            } else {
              update.mutate({ id: dialogState.id, patch: input }, { onSuccess: () => setDialogState("closed") });
            }
          }}
        />
      ) : null}
    </div>
  );
}
