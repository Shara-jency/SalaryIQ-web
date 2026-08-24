import type { IDBPDatabase } from "idb";
import type { ISalaryEntryRepository } from "@domain/repositories";
import type { CreateSalaryEntryInput, Id, SalaryEntry } from "@domain/models";
import type { SalaryIQDB } from "./db";
import { generateId } from "./idGenerator";

export class LocalSalaryEntryRepository implements ISalaryEntryRepository {
  private readonly dbPromise: Promise<IDBPDatabase<SalaryIQDB>>;

  constructor(dbPromise: Promise<IDBPDatabase<SalaryIQDB>>) {
    this.dbPromise = dbPromise;
  }

  async list(profileId: Id): Promise<SalaryEntry[]> {
    const db = await this.dbPromise;
    const entries = await db.getAllFromIndex("salaryEntries", "by-profileId", profileId);
    return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getById(id: Id): Promise<SalaryEntry | null> {
    const db = await this.dbPromise;
    return (await db.get("salaryEntries", id)) ?? null;
  }

  async getLatest(profileId: Id): Promise<SalaryEntry | null> {
    const entries = await this.list(profileId);
    return entries[0] ?? null;
  }

  async create(input: CreateSalaryEntryInput): Promise<SalaryEntry> {
    const db = await this.dbPromise;
    // `hasEmployerPf` is only needed for the API mode's server-side
    // recompute (see CreateSalaryEntryInput) — monthlyInHand/annualTax here
    // were already computed with it client-side, so it isn't a SalaryEntry field.
    const { hasEmployerPf, ...rest } = input;
    void hasEmployerPf;
    const entry: SalaryEntry = {
      id: generateId(),
      ...rest,
      createdAt: new Date().toISOString(),
    };
    await db.put("salaryEntries", entry);
    return entry;
  }

  async delete(id: Id): Promise<void> {
    const db = await this.dbPromise;
    await db.delete("salaryEntries", id);
  }
}
