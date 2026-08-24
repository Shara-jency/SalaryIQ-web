import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Input, Select } from "@shared/ui";
import { CITIES, COMPANY_TIERS, INDUSTRIES, JOB_TITLES, TAX_REGIMES } from "@shared/constants/data";
import { formatIndianCurrencyInput, parseCurrencyInput } from "@shared/utils/currency";
import { useCurrentProfile } from "@features/profile/hooks/useProfile";
import type { CompanyTier, Profile, TaxRegime } from "@domain/models";
import type { SalaryAnalyzerFormInput } from "../types";

interface AnalyzerFormProps {
  onSubmit: (form: SalaryAnalyzerFormInput) => void;
  isSubmitting?: boolean;
}

function selfDefaults(profile: Profile | null) {
  return {
    jobTitle: profile && JOB_TITLES.includes(profile.currentRole) ? profile.currentRole : JOB_TITLES[0],
    experience: profile?.experienceYears ? String(profile.experienceYears) : "",
    city: profile && CITIES.includes(profile.location) ? profile.location : CITIES[0],
    industry: profile && INDUSTRIES.includes(profile.industry) ? profile.industry : INDUSTRIES[0],
  };
}

export function AnalyzerForm({ onSubmit, isSubmitting }: AnalyzerFormProps) {
  const { profile } = useCurrentProfile();
  const [analysisFor, setAnalysisFor] = useState<"self" | "someone_else">("self");
  const [jobTitle, setJobTitle] = useState(() => selfDefaults(profile).jobTitle);
  const [experience, setExperience] = useState(() => selfDefaults(profile).experience);
  const [city, setCity] = useState(() => selfDefaults(profile).city);
  const [industry, setIndustry] = useState(() => selfDefaults(profile).industry);
  const [companyTier, setCompanyTier] = useState<CompanyTier>("tier2");
  const [ctcInput, setCtcInput] = useState("");
  const [monthlyOverrideInput, setMonthlyOverrideInput] = useState("");
  const [taxRegime, setTaxRegime] = useState<TaxRegime>("new");
  const [hasEmployerPf, setHasEmployerPf] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydratedFromProfile, setHydratedFromProfile] = useState(false);

  useEffect(() => {
    if (!profile || hydratedFromProfile) return;
    const defaults = selfDefaults(profile);
    setJobTitle(defaults.jobTitle);
    setExperience(defaults.experience);
    setCity(defaults.city);
    setIndustry(defaults.industry);
    setHydratedFromProfile(true);
  }, [profile, hydratedFromProfile]);

  const handleAnalysisForChange = (option: "self" | "someone_else") => {
    setAnalysisFor(option);
    if (option === "self") {
      const defaults = selfDefaults(profile);
      setJobTitle(defaults.jobTitle);
      setExperience(defaults.experience);
      setCity(defaults.city);
      setIndustry(defaults.industry);
    } else {
      setJobTitle(JOB_TITLES[0]);
      setExperience("");
      setCity(CITIES[0]);
      setIndustry(INDUSTRIES[0]);
    }
  };

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
      hasEmployerPf,
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
              onClick={() => handleAnalysisForChange(option)}
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
          step="any"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="e.g. 5.5"
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
        <Select
          label="Employer PF contribution"
          value={hasEmployerPf ? "yes" : "no"}
          onChange={(e) => setHasEmployerPf(e.target.value === "yes")}
          options={[
            { value: "yes", label: "Yes, part of my CTC" },
            { value: "no", label: "No, only my own PF is deducted" },
          ]}
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
