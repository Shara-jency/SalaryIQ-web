import { Card } from "@shared/ui";
import { formatCurrency } from "@shared/utils/currency";
import { getSalaryBreakdown } from "@domain/logic";
import type { TaxRegime } from "@domain/models";

interface SalaryBreakdownPanelProps {
  annualCtc: number;
  taxRegime: TaxRegime;
  onBack: () => void;
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        {sub ? <p className="text-xs text-text-light">{sub}</p> : null}
      </div>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

export function SalaryBreakdownPanel({ annualCtc, taxRegime, onBack }: SalaryBreakdownPanelProps) {
  const breakdown = getSalaryBreakdown(annualCtc, taxRegime);

  return (
    <Card>
      <button onClick={onBack} className="mb-4 text-sm font-semibold text-primary hover:underline">
        ← Back to result
      </button>
      <h2 className="mb-4 text-lg font-bold">Salary breakdown</h2>

      <Row label="Annual CTC" value={formatCurrency(breakdown.annualCTC)} />
      <Row label="Standard deduction" value={formatCurrency(breakdown.standardDeduction)} sub={taxRegime === "new" ? "New regime" : "Old regime"} />
      <Row label="Taxable income" value={formatCurrency(breakdown.taxableIncome)} />
      <Row label="Annual tax" value={formatCurrency(breakdown.annualTax)} sub={`${breakdown.taxPercentage}% of CTC`} />
      <Row label="Annual in-hand" value={formatCurrency(breakdown.annualInHand)} sub={`${breakdown.takeHomePercentage}% take-home`} />
      <Row label="Monthly CTC" value={formatCurrency(breakdown.monthlyCTC)} />
      <Row label="Monthly tax" value={formatCurrency(breakdown.monthlyTax)} />
      <Row label="Monthly in-hand" value={formatCurrency(breakdown.monthlyInHand)} />

      <p className="mt-4 text-xs text-text-light">
        Estimated calculation based on CTC and tax regime; actual in-hand may differ depending on your employer's
        specific salary structure, PF, and bonuses.
      </p>
    </Card>
  );
}
