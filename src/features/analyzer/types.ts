import type { AnalysisFor, CompanyTier, TaxRegime } from "@domain/models";

export interface SalaryAnalyzerFormInput {
  analysisFor: AnalysisFor;
  jobTitle: string;
  experienceYears: number;
  city: string;
  industry: string;
  companyTier: CompanyTier;
  annualCtc: number;
  monthlyInHandOverride?: number;
  taxRegime: TaxRegime;
  hasEmployerPf: boolean;
}
