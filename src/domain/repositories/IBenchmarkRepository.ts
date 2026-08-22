import type { BenchmarkMatchCriteria, BenchmarkMatchResult, MarketBenchmark } from "../models";

export interface IBenchmarkRepository {
  findAll(): Promise<MarketBenchmark[]>;
  findByCity(city: string): Promise<MarketBenchmark[]>;
  match(criteria: BenchmarkMatchCriteria): Promise<BenchmarkMatchResult>;
}
