import type { IBenchmarkRepository, ISeedable } from "@domain/repositories";
import type { BenchmarkMatchCriteria, BenchmarkMatchResult, MarketBenchmark } from "@domain/models";
import type { HttpClient } from "./httpClient";

export class ApiBenchmarkRepository implements IBenchmarkRepository, ISeedable {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async findAll(): Promise<MarketBenchmark[]> {
    return this.http.get<MarketBenchmark[]>("/api/benchmarks");
  }

  async findByCity(city: string): Promise<MarketBenchmark[]> {
    return this.http.get<MarketBenchmark[]>(`/api/benchmarks?city=${encodeURIComponent(city)}`);
  }

  async match(criteria: BenchmarkMatchCriteria): Promise<BenchmarkMatchResult> {
    return this.http.post<BenchmarkMatchResult>("/api/benchmarks/match", criteria);
  }

  // Seeding is a one-time server-side step (prisma/seed.ts) — a no-op here
  // so RepositoryProvider's bootstrap call stays harmless in api mode.
  async seedIfEmpty(): Promise<void> {}
}
