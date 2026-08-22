import {
  getDb,
  LocalProfileRepository,
  LocalSalaryEntryRepository,
  LocalSalaryHistoryRepository,
  LocalGrowthProjectionRepository,
  LocalBenchmarkRepository,
} from "@infrastructure/local";
import {
  createHttpClient,
  ApiProfileRepository,
  ApiSalaryEntryRepository,
  ApiSalaryHistoryRepository,
  ApiGrowthProjectionRepository,
  ApiBenchmarkRepository,
  type HttpClientDeps,
} from "@infrastructure/api";
import type {
  IProfileRepository,
  ISalaryEntryRepository,
  ISalaryHistoryRepository,
  IGrowthProjectionRepository,
  IBenchmarkRepository,
  ISeedable,
} from "@domain/repositories";

export type DataMode = "local" | "api";

export interface Repositories {
  profileRepo: IProfileRepository;
  salaryEntryRepo: ISalaryEntryRepository;
  salaryHistoryRepo: ISalaryHistoryRepository;
  growthProjectionRepo: IGrowthProjectionRepository;
  benchmarkRepo: IBenchmarkRepository & Partial<ISeedable>;
}

export function resolveDataMode(): DataMode {
  const configured = import.meta.env.VITE_DATA_MODE;
  return configured === "api" ? "api" : "local";
}

/**
 * The one place that decides Local vs Api repository implementations.
 * Swapping storage is: set VITE_DATA_MODE=api (and supply httpClientDeps,
 * wired to AuthProvider by RepositoryProvider) — nothing in features/** or
 * domain/** needs to change either way.
 */
export function createRepositories(options?: {
  mode?: DataMode;
  httpClientDeps?: HttpClientDeps;
}): Repositories {
  const mode = options?.mode ?? resolveDataMode();

  if (mode === "api") {
    if (!options?.httpClientDeps) {
      throw new Error("api data mode requires httpClientDeps (see RepositoryProvider).");
    }
    const http = createHttpClient(options.httpClientDeps);
    return {
      profileRepo: new ApiProfileRepository(http),
      salaryEntryRepo: new ApiSalaryEntryRepository(http),
      salaryHistoryRepo: new ApiSalaryHistoryRepository(http),
      growthProjectionRepo: new ApiGrowthProjectionRepository(http),
      benchmarkRepo: new ApiBenchmarkRepository(http),
    };
  }

  const dbPromise = getDb();
  return {
    profileRepo: new LocalProfileRepository(dbPromise),
    salaryEntryRepo: new LocalSalaryEntryRepository(dbPromise),
    salaryHistoryRepo: new LocalSalaryHistoryRepository(dbPromise),
    growthProjectionRepo: new LocalGrowthProjectionRepository(dbPromise),
    benchmarkRepo: new LocalBenchmarkRepository(dbPromise),
  };
}
