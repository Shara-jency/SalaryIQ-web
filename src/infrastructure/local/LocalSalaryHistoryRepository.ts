import type { IDBPDatabase } from "idb";
import type { ISalaryHistoryRepository } from "@domain/repositories";
import type {
  CreateSalaryHistoryInput,
  Id,
  SalaryHistoryEntry,
  UpdateSalaryHistoryInput,
} from "@domain/models";
import type { SalaryIQDB } from "./db";
import { generateId } from "./idGenerator";

export class LocalSalaryHistoryRepository implements ISalaryHistoryRepository {
  private readonly dbPromise: Promise<IDBPDatabase<SalaryIQDB>>;

  constructor(dbPromise: Promise<IDBPDatabase<SalaryIQDB>>) {
    this.dbPromise = dbPromise;
  }

  async list(profileId: Id): Promise<SalaryHistoryEntry[]> {
    const db = await this.dbPromise;
    const entries = await db.getAllFromIndex("salaryHistory", "by-profileId", profileId);
    return entries.sort((a, b) => a.year - b.year || a.createdAt.localeCompare(b.createdAt));
  }

  async getById(id: Id): Promise<SalaryHistoryEntry | null> {
    const db = await this.dbPromise;
    return (await db.get("salaryHistory", id)) ?? null;
  }

  async create(input: CreateSalaryHistoryInput): Promise<SalaryHistoryEntry> {
    const db = await this.dbPromise;
    const entry: SalaryHistoryEntry = {
      id: generateId(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    await db.put("salaryHistory", entry);
    return entry;
  }

  async update(id: Id, patch: UpdateSalaryHistoryInput): Promise<SalaryHistoryEntry> {
    const db = await this.dbPromise;
    const existing = await db.get("salaryHistory", id);
    if (!existing) {
      throw new Error(`Salary history entry ${id} not found`);
    }
    const updated: SalaryHistoryEntry = { ...existing, ...patch };
    await db.put("salaryHistory", updated);
    return updated;
  }

  async delete(id: Id): Promise<void> {
    const db = await this.dbPromise;
    await db.delete("salaryHistory", id);
  }
}
