import { Badge, Button, Card, StatTile } from "@shared/ui";
import { formatCurrency } from "@shared/utils/currency";
import type { AnalysisResult } from "../hooks/useSalaryAnalyzer";

interface AnalysisResultPanelProps {
  result: AnalysisResult;
  onViewBreakdown: () => void;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
  saveError: string | null;
}

export function AnalysisResultPanel({ result, onViewBreakdown, onSave, isSaving, isSaved, saveError }: AnalysisResultPanelProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Result</h2>
        <Badge tone={result.isUnderpaid ? "danger" : "success"}>{result.status}</Badge>
      </div>

      {result.form.analysisFor === "someone_else" ? (
        <p className="mb-4 rounded-lg bg-primary-light px-3 py-2 text-xs text-primary">
          This is a one-time analysis and was not saved.
        </p>
      ) : (
        <div className="mb-4">
          {isSaved ? (
            <p className="rounded-lg bg-success-light px-3 py-2 text-xs text-success">
              Saved to your salary history.
            </p>
          ) : (
            <Button variant="secondary" className="w-full" loading={isSaving} onClick={onSave}>
              Save this analysis
            </Button>
          )}
          {saveError ? <p className="mt-2 text-xs text-danger">{saveError}</p> : null}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatTile label="Annual CTC entered" value={formatCurrency(result.form.annualCtc)} />
        <StatTile label="Monthly in-hand (est.)" value={formatCurrency(result.monthlyInHand)} />
        <StatTile label="Market average" value={formatCurrency(result.marketAverage)} sub={`matched: ${result.matchedJobTitle}`} />
        <StatTile
          label={result.isUnderpaid ? "Below market by" : "Above market by"}
          value={`${formatCurrency(result.difference)} (${result.percentage}%)`}
        />
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-app-background">
        <div
          className={`h-full ${result.isUnderpaid ? "bg-danger" : "bg-success"}`}
          style={{
            width: `${Math.min(100, Math.max(5, 50 + result.percentage * (result.isUnderpaid ? -1 : 1) * 0.5))}%`,
          }}
        />
      </div>

      <p className="mb-4 text-xs text-text-light">
        Market range: {formatCurrency(result.marketMin)} – {formatCurrency(result.marketMax)}. Role title is matched
        first by exact/partial title, then inferred from keywords, then by experience — figures reflect India
        2025–2026 market data.
      </p>

      <button onClick={onViewBreakdown} className="text-sm font-semibold text-primary hover:underline">
        View full salary breakdown →
      </button>
    </Card>
  );
}
