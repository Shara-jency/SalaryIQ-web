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
    const entry: SalaryEntry = {
      id: generateId(),
      ...input,
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
