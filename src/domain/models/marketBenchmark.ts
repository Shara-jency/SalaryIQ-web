import type { Id } from "./common";

export interface MarketBenchmark {
  id: Id;
  jobTitle: string;
  city: string;
  minCtc: number;
  avgCtc: number;
  maxCtc: number;
}

export type BenchmarkMatchType =
  | "exact"
  | "partial"
  | "keyword"
  | "experience_fallback"
  | "none";

export interface BenchmarkMatchCriteria {
  jobTitle: string;
  city: string;
  experienceYears: number;
}

export interface BenchmarkMatchResult {
  benchmark: MarketBenchmark;
  matchType: BenchmarkMatchType;
  matchedJobTitle: string;
}
