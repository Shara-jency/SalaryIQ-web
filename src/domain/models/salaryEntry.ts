import type { Id, ISODateString } from "./common";

export type AnalysisFor = "self" | "someone_else";
export type TaxRegime = "new" | "old";
export type CompanyTier = "tier1" | "tier2" | "tier3";

export interface SalaryEntry {
  id: Id;
  profileId: Id;
  analysisFor: AnalysisFor;
  jobTitle: string;
  experienceYears: number;
  city: string;
  industry: string;
  companyTier: CompanyTier;
  annualCtc: number;
  monthlyInHandOverride?: number;
  taxRegime: TaxRegime;
  monthlyInHand: number;
  annualTax: number;
  createdAt: ISODateString;
}

export type CreateSalaryEntryInput = Omit<
  SalaryEntry,
  "id" | "createdAt" | "monthlyInHand" | "annualTax"
> & {
  monthlyInHand: number;
  annualTax: number;
};
