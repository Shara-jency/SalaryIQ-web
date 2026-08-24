import { useState } from "react";
import { AnalyzerForm } from "./components/AnalyzerForm";
import { AnalysisResultPanel } from "./components/AnalysisResultPanel";
import { SalaryBreakdownPanel } from "./components/SalaryBreakdownPanel";
import { useSalaryAnalyzer, useSaveSalaryAnalysis, type AnalysisResult } from "./hooks/useSalaryAnalyzer";

export function AnalyzerPage() {
  const analyze = useSalaryAnalyzer();
  const saveAnalysis = useSaveSalaryAnalysis();
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
            saveAnalysis.reset();
            analyze.mutate(form, { onSuccess: setResult });
          }}
        />

        <div>
          {analyze.isError ? (
            <p className="text-sm text-danger">{(analyze.error as Error).message}</p>
          ) : null}

          {result && !showBreakdown ? (
            <AnalysisResultPanel
              result={result}
              onViewBreakdown={() => setShowBreakdown(true)}
              onSave={() => saveAnalysis.mutate(result)}
              isSaving={saveAnalysis.isPending}
              isSaved={saveAnalysis.isSuccess}
              saveError={saveAnalysis.isError ? (saveAnalysis.error as Error).message : null}
            />
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
