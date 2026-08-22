import { useState, type FormEvent } from "react";
import { Button, Input } from "@shared/ui";
import { formatIndianCurrencyInput, parseCurrencyInput } from "@shared/utils/currency";
import type { CreateSalaryHistoryInput, SalaryHistoryEntry } from "@domain/models";

interface SalaryHistoryFormDialogProps {
  profileId: string;
  initial?: SalaryHistoryEntry;
  onSubmit: (input: CreateSalaryHistoryInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SalaryHistoryFormDialog({
  profileId,
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
}: SalaryHistoryFormDialogProps) {
  const [year, setYear] = useState(String(initial?.year ?? new Date().getFullYear()));
  const [annualCtc, setAnnualCtc] = useState(initial ? String(initial.annualCtc) : "");
  const [monthlyInHand, setMonthlyInHand] = useState(initial?.monthlyInHand ? String(initial.monthlyInHand) : "");
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const yearNum = Number(year);
    const ctc = parseCurrencyInput(annualCtc);

    if (!Number.isFinite(yearNum) || yearNum < 1990 || yearNum > 2100) {
      setError("Please enter a valid year.");
      return;
    }
    if (!Number.isFinite(ctc) || ctc <= 0) {
      setError("Please enter a valid annual CTC.");
      return;
    }

    setError(null);
    onSubmit({
      profileId,
      year: yearNum,
      annualCtc: ctc,
      monthlyInHand: monthlyInHand ? parseCurrencyInput(monthlyInHand) : undefined,
      jobTitle: jobTitle.trim() || undefined,
      company: company.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6">
        <h2 className="mb-4 text-lg font-bold">{initial ? "Edit entry" : "Add salary history"}</h2>
        <form onSubmit={handleSubmit}>
          <Input label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          <Input label="Annual CTC (₹)" inputMode="numeric" value={annualCtc} onChange={(e) => setAnnualCtc(formatIndianCurrencyInput(e.target.value))} />
          <Input
            label="Monthly in-hand (optional)"
            inputMode="numeric"
            value={monthlyInHand}
            onChange={(e) => setMonthlyInHand(formatIndianCurrencyInput(e.target.value))}
          />
          <Input label="Job title (optional)" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          <Input label="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

          {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
