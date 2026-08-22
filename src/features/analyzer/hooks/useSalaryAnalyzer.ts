import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@app/RepositoryProvider";
import { useCurrentProfile } from "@features/profile/hooks/useProfile";
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
  savedEntry?: SalaryEntry;
}

export function useSalaryAnalyzer() {
  const { salaryEntryRepo, benchmarkRepo } = useRepositories();
  const { profile } = useCurrentProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: SalaryAnalyzerFormInput): Promise<AnalysisResult> => {
      const taxResult = calculateInHandSalary(form.annualCtc, form.taxRegime);
      const monthlyInHand = form.monthlyInHandOverride ?? taxResult.monthlyInHand;

      const matched = await benchmarkRepo.match({
        jobTitle: form.jobTitle,
        city: form.city,
        experienceYears: form.experienceYears,
      });
      const adjusted = adjustBenchmarkForCompanyTier(matched.benchmark, form.companyTier);
      const comparison = compareWithMarket(form.annualCtc, adjusted.avgCtc);

      let savedEntry: SalaryEntry | undefined;
      if (form.analysisFor === "self") {
        if (!profile) {
          throw new Error("Set up your profile before saving an analysis.");
        }
        savedEntry = await salaryEntryRepo.create({
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
          annualTax: taxResult.annualTax,
        });
      }

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
        savedEntry,
      };
    },
    onSuccess: (result) => {
      if (result.savedEntry && profile) {
        queryClient.invalidateQueries({ queryKey: salaryEntriesQueryKey(profile.id) });
      }
    },
  });
}
