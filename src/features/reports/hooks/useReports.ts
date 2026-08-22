import { useMemo } from "react";
import { useCurrentProfile } from "@features/profile/hooks/useProfile";
import { useSalaryEntries } from "@features/analyzer/hooks/useSalaryEntries";
import type { SalaryEntry } from "@domain/models";

export interface ReportsSummary {
  savedCount: number;
  averageCtc: number;
  highestCtc: number;
  averageMonthlyInHand: number;
  distinctRoles: number;
  recent: SalaryEntry[];
}

function summarize(entries: SalaryEntry[]): ReportsSummary {
  if (entries.length === 0) {
    return { savedCount: 0, averageCtc: 0, highestCtc: 0, averageMonthlyInHand: 0, distinctRoles: 0, recent: [] };
  }

  const totalCtc = entries.reduce((sum, e) => sum + e.annualCtc, 0);
  const totalMonthly = entries.reduce((sum, e) => sum + e.monthlyInHand, 0);
  const highestCtc = Math.max(...entries.map((e) => e.annualCtc));
  const distinctRoles = new Set(entries.map((e) => e.jobTitle.toLowerCase())).size;

  return {
    savedCount: entries.length,
    averageCtc: Math.round(totalCtc / entries.length),
    highestCtc,
    averageMonthlyInHand: Math.round(totalMonthly / entries.length),
    distinctRoles,
    recent: entries.slice(0, 5),
  };
}

export function useReports() {
  const { profile } = useCurrentProfile();
  const { data: entries = [], isLoading } = useSalaryEntries(profile?.id);

  const summary = useMemo(() => summarize(entries), [entries]);

  return { summary, isLoading };
}
