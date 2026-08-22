import type { CompanyTier, MarketBenchmark } from "../models";

const COMPANY_TIER_MULTIPLIERS: Record<CompanyTier, number> = {
  tier1: 1,
  tier2: 0.8,
  tier3: 0.65,
};

export function adjustBenchmarkForCompanyTier(
  benchmark: MarketBenchmark,
  companyTier: CompanyTier,
): MarketBenchmark {
  const multiplier = COMPANY_TIER_MULTIPLIERS[companyTier] ?? 1;

  return {
    ...benchmark,
    minCtc: Math.round(benchmark.minCtc * multiplier),
    avgCtc: Math.round(benchmark.avgCtc * multiplier),
    maxCtc: Math.round(benchmark.maxCtc * multiplier),
  };
}
