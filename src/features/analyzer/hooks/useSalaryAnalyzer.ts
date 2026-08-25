import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@app/RepositoryProvider";
import { PROFILE_QUERY_KEY, useCurrentProfile } from "@features/profile/hooks/useProfile";
import {
  adjustBenchmarkForCompanyTier,
  calculateInHandSalary,
  compareWithMarket,
} from "@domain/logic";
import type { SalaryEntry } from "@domain/models";
import type { SalaryAnalyzerFormInput } from "../types";
import { salaryEntriesQueryKey } from "./useSalaryEntries";

export interface AnalysisResult {
  form: SalaryAnalyzerFormInput;
  monthlyInHand: number;
  annualTax: number;
  takeHomePercentage: number;
  marketMin: number;
  marketAverage: number;
  marketMax: number;
  matchedJobTitle: string;
  difference: number;
  percentage: number;
  status: string;
  isUnderpaid: boolean;
}

export function useSalaryAnalyzer() {
  const { benchmarkRepo } = useRepositories();

  return useMutation({
    mutationFn: async (form: SalaryAnalyzerFormInput): Promise<AnalysisResult> => {
      const taxResult = calculateInHandSalary(form.annualCtc, form.taxRegime, form.hasEmployerPf);
      const monthlyInHand = form.monthlyInHandOverride ?? taxResult.monthlyInHand;

      const matched = await benchmarkRepo.match({
        jobTitle: form.jobTitle,
        city: form.city,
        experienceYears: form.experienceYears,
      });
      const adjusted = adjustBenchmarkForCompanyTier(matched.benchmark, form.companyTier);
      const comparison = compareWithMarket(form.annualCtc, adjusted.avgCtc);

      return {
        form,
        monthlyInHand,
        annualTax: taxResult.annualTax,
        takeHomePercentage: taxResult.takeHomePercentage,
        marketMin: adjusted.minCtc,
        marketAverage: adjusted.avgCtc,
        marketMax: adjusted.maxCtc,
        matchedJobTitle: matched.matchedJobTitle,
        difference: comparison.difference,
        percentage: comparison.percentage,
        status: comparison.status,
        isUnderpaid: comparison.isUnderpaid,
      };
    },
  });
}

// Saving is a separate, explicit step (see AnalysisResultPanel's "Save this
// analysis" button) — analyzing no longer saves automatically, so the user
// can try numbers out before deciding to keep one in their history. Saving
// also syncs the profile's Current CTC to match, since a saved self-analysis
// represents the user's real current pay (Current CTC stays independently
// editable on the Profile page too — see ProfileForm).
export function useSaveSalaryAnalysis() {
  const { salaryEntryRepo, profileRepo } = useRepositories();
  const { profile } = useCurrentProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: AnalysisResult): Promise<SalaryEntry> => {
      if (!profile) {
        throw new Error("Set up your profile before saving an analysis.");
      }
      const { form, monthlyInHand, annualTax } = result;
      const [entry] = await Promise.all([
        salaryEntryRepo.create({
          profileId: profile.id,
          analysisFor: form.analysisFor,
          jobTitle: form.jobTitle,
          experienceYears: form.experienceYears,
          city: form.city,
          industry: form.industry,
          companyTier: form.companyTier,
          annualCtc: form.annualCtc,
          monthlyInHandOverride: form.monthlyInHandOverride,
          taxRegime: form.taxRegime,
          monthlyInHand,
          annualTax,
          hasEmployerPf: form.hasEmployerPf,
        }),
        profileRepo.updateProfile(profile.id, { currentCtc: form.annualCtc }),
      ]);
      return entry;
    },
    onSuccess: () => {
      if (profile) {
        queryClient.invalidateQueries({ queryKey: salaryEntriesQueryKey(profile.id) });
        queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      }
    },
  });
}
