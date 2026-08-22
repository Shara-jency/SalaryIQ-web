import type { IDBPDatabase } from "idb";
import type { IBenchmarkRepository, ISeedable } from "@domain/repositories";
import type { BenchmarkMatchCriteria, BenchmarkMatchResult, MarketBenchmark } from "@domain/models";
import { matchBenchmark } from "@domain/logic";
import type { SalaryIQDB } from "./db";
import { generateId } from "./idGenerator";
import seedRows from "./seed/marketBenchmarks.seed.json";

const SEEDED_FLAG_KEY = "benchmarksSeeded";

export class LocalBenchmarkRepository implements IBenchmarkRepository, ISeedable {
  private readonly dbPromise: Promise<IDBPDatabase<SalaryIQDB>>;

  constructor(dbPromise: Promise<IDBPDatabase<SalaryIQDB>>) {
    this.dbPromise = dbPromise;
  }

  async findAll(): Promise<MarketBenchmark[]> {
    const db = await this.dbPromise;
    return db.getAll("marketBenchmarks");
  }

  async findByCity(city: string): Promise<MarketBenchmark[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex("marketBenchmarks", "by-city", city);
  }

  async match(criteria: BenchmarkMatchCriteria): Promise<BenchmarkMatchResult> {
    const all = await this.findAll();
    return matchBenchmark(criteria, all);
  }

  async seedIfEmpty(): Promise<void> {
    const db = await this.dbPromise;
    const meta = await db.get("meta", SEEDED_FLAG_KEY);
    if (meta?.value === true) {
      return;
    }

    const tx = db.transaction(["marketBenchmarks", "meta"], "readwrite");
    const benchmarkStore = tx.objectStore("marketBenchmarks");

    for (const row of seedRows as Array<Omit<MarketBenchmark, "id">>) {
      await benchmarkStore.put({ id: generateId(), ...row });
    }

    await tx.objectStore("meta").put({ key: SEEDED_FLAG_KEY, value: true });
    await tx.done;
  }
}
