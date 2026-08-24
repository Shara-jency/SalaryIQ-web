import { useState } from "react";
import { AnalyzerForm } from "./components/AnalyzerForm";
import { AnalysisResultPanel } from "./components/AnalysisResultPanel";
import { SalaryBreakdownPanel } from "./components/SalaryBreakdownPanel";
import { useSalaryAnalyzer, type AnalysisResult } from "./hooks/useSalaryAnalyzer";

export function AnalyzerPage() {
  const analyze = useSalaryAnalyzer();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Salary Analyzer</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyzerForm
          isSubmitting={analyze.isPending}
          onSubmit={(form) => {
            setShowBreakdown(false);
            analyze.mutate(form, { onSuccess: setResult });
          }}
        />

        <div>
          {analyze.isError ? (
            <p className="text-sm text-danger">{(analyze.error as Error).message}</p>
          ) : null}

          {result && !showBreakdown ? (
            <AnalysisResultPanel result={result} onViewBreakdown={() => setShowBreakdown(true)} />
          ) : null}

          {result && showBreakdown ? (
            <SalaryBreakdownPanel
              annualCtc={result.form.annualCtc}
              taxRegime={result.form.taxRegime}
              hasEmployerPf={result.form.hasEmployerPf}
              onBack={() => setShowBreakdown(false)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
