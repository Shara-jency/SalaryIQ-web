import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  GrowthProjection,
  Id,
  MarketBenchmark,
  Profile,
  SalaryEntry,
  SalaryHistoryEntry,
} from "@domain/models";

interface MetaRecord {
  key: string;
  value: unknown;
}

export interface SalaryIQDB extends DBSchema {
  profile: { key: Id; value: Profile };
  salaryEntries: { key: Id; value: SalaryEntry; indexes: { "by-profileId": Id } };
  salaryHistory: { key: Id; value: SalaryHistoryEntry; indexes: { "by-profileId": Id } };
  growthProjections: { key: Id; value: GrowthProjection; indexes: { "by-profileId": Id } };
  marketBenchmarks: {
    key: Id;
    value: MarketBenchmark;
    indexes: { "by-city": string; "by-title-city": [string, string] };
  };
  meta: { key: string; value: MetaRecord };
}

const DB_NAME = "salaryiq-web";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SalaryIQDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<SalaryIQDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SalaryIQDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("profile", { keyPath: "id" });

        const entries = db.createObjectStore("salaryEntries", { keyPath: "id" });
        entries.createIndex("by-profileId", "profileId");

        const history = db.createObjectStore("salaryHistory", { keyPath: "id" });
        history.createIndex("by-profileId", "profileId");

        const growth = db.createObjectStore("growthProjections", { keyPath: "id" });
        growth.createIndex("by-profileId", "profileId");

        const benchmarks = db.createObjectStore("marketBenchmarks", { keyPath: "id" });
        benchmarks.createIndex("by-city", "city");
        benchmarks.createIndex("by-title-city", ["jobTitle", "city"]);

        db.createObjectStore("meta", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

/**
 * Test-only: closes the cached connection (so IndexedDB.deleteDatabase doesn't
 * hang waiting for it) and forces the next getDb() call to open a fresh one.
 */
export async function resetDbForTests(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
  }
  dbPromise = null;
}
