import { useState, type FormEvent } from "react";
import { Button, Card, Input, Select } from "@shared/ui";
import { CITIES, COMPANY_TIERS, INDUSTRIES, JOB_TITLES, TAX_REGIMES } from "@shared/constants/data";
import { formatIndianCurrencyInput, parseCurrencyInput } from "@shared/utils/currency";
import type { CompanyTier, TaxRegime } from "@domain/models";
import type { SalaryAnalyzerFormInput } from "../types";

interface AnalyzerFormProps {
  onSubmit: (form: SalaryAnalyzerFormInput) => void;
  isSubmitting?: boolean;
}

export function AnalyzerForm({ onSubmit, isSubmitting }: AnalyzerFormProps) {
  const [analysisFor, setAnalysisFor] = useState<"self" | "someone_else">("self");
  const [jobTitle, setJobTitle] = useState(JOB_TITLES[0]);
  const [experience, setExperience] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [companyTier, setCompanyTier] = useState<CompanyTier>("tier2");
  const [ctcInput, setCtcInput] = useState("");
  const [monthlyOverrideInput, setMonthlyOverrideInput] = useState("");
  const [taxRegime, setTaxRegime] = useState<TaxRegime>("new");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const annualCtc = parseCurrencyInput(ctcInput);
    const experienceYears = Number(experience);

    if (!experience || !ctcInput) {
      setError("Please enter experience and annual CTC.");
      return;
    }
    if (Number.isNaN(annualCtc) || annualCtc <= 0) {
      setError("Please enter a valid annual CTC.");
      return;
    }
    if (Number.isNaN(experienceYears) || experienceYears < 0 || experienceYears > 60) {
      setError("Please enter a valid experience between 0 and 60 years.");
      return;
    }

    setError(null);
    onSubmit({
      analysisFor,
      jobTitle,
      experienceYears,
      city,
      industry,
      companyTier,
      annualCtc,
      monthlyInHandOverride: monthlyOverrideInput ? parseCurrencyInput(monthlyOverrideInput) : undefined,
      taxRegime,
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex gap-2">
          {(["self", "someone_else"] as const).map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setAnalysisFor(option)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                analysisFor === option
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border text-text-secondary"
              }`}
            >
              {option === "self" ? "For myself" : "For someone else"}
            </button>
          ))}
        </div>

        <Select
          label="Job title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          options={JOB_TITLES.map((t) => ({ value: t, label: t }))}
        />
        <Input
          label="Experience (years)"
          type="number"
          min={0}
          max={60}
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="e.g. 5"
        />
        <Select label="City" value={city} onChange={(e) => setCity(e.target.value)} options={CITIES.map((c) => ({ value: c, label: c }))} />
        <Select
          label="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
        />
        <Select
          label="Company tier"
          value={companyTier}
          onChange={(e) => setCompanyTier(e.target.value as CompanyTier)}
          options={COMPANY_TIERS}
        />
        <Input
          label="Annual CTC (₹)"
          inputMode="numeric"
          value={ctcInput}
          onChange={(e) => setCtcInput(formatIndianCurrencyInput(e.target.value))}
          placeholder="e.g. 18,00,000"
        />
        <Input
          label="Monthly in-hand override (optional)"
          inputMode="numeric"
          value={monthlyOverrideInput}
          onChange={(e) => setMonthlyOverrideInput(formatIndianCurrencyInput(e.target.value))}
          placeholder="Leave blank to auto-calculate"
        />
        <Select
          label="Tax regime"
          value={taxRegime}
          onChange={(e) => setTaxRegime(e.target.value as TaxRegime)}
          options={TAX_REGIMES}
        />

        {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

        <p className="mb-4 text-xs text-text-light">
          Figures are estimates based on standard salary structure assumptions and India 2025–26 tax rules.
        </p>

        <Button type="submit" loading={isSubmitting} className="w-full">
          Analyze
        </Button>
      </form>
    </Card>
  );
}
