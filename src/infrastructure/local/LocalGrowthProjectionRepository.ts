import type { IDBPDatabase } from "idb";
import type { IGrowthProjectionRepository } from "@domain/repositories";
import type { CreateGrowthProjectionInput, GrowthProjection, Id } from "@domain/models";
import type { SalaryIQDB } from "./db";
import { generateId } from "./idGenerator";

export class LocalGrowthProjectionRepository implements IGrowthProjectionRepository {
  private readonly dbPromise: Promise<IDBPDatabase<SalaryIQDB>>;

  constructor(dbPromise: Promise<IDBPDatabase<SalaryIQDB>>) {
    this.dbPromise = dbPromise;
  }

  async list(profileId: Id): Promise<GrowthProjection[]> {
    const db = await this.dbPromise;
    const entries = await db.getAllFromIndex("growthProjections", "by-profileId", profileId);
    return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getLatest(profileId: Id): Promise<GrowthProjection | null> {
    const entries = await this.list(profileId);
    return entries[0] ?? null;
  }

  async create(input: CreateGrowthProjectionInput): Promise<GrowthProjection> {
    const db = await this.dbPromise;
    const projection: GrowthProjection = {
      id: generateId(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    await db.put("growthProjections", projection);
    return projection;
  }

  async update(
    id: Id,
    patch: Partial<CreateGrowthProjectionInput>,
  ): Promise<GrowthProjection> {
    const db = await this.dbPromise;
    const existing = await db.get("growthProjections", id);
    if (!existing) {
      throw new Error(`Growth projection ${id} not found`);
    }
    const updated: GrowthProjection = { ...existing, ...patch };
    await db.put("growthProjections", updated);
    return updated;
  }

  async delete(id: Id): Promise<void> {
    const db = await this.dbPromise;
    await db.delete("growthProjections", id);
  }
}
