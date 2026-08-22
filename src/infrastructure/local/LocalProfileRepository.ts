import type { IDBPDatabase } from "idb";
import type { IProfileRepository } from "@domain/repositories";
import type { CreateProfileInput, Id, Profile, UpdateProfileInput } from "@domain/models";
import type { SalaryIQDB } from "./db";
import { generateId } from "./idGenerator";

export class LocalProfileRepository implements IProfileRepository {
  private readonly dbPromise: Promise<IDBPDatabase<SalaryIQDB>>;

  constructor(dbPromise: Promise<IDBPDatabase<SalaryIQDB>>) {
    this.dbPromise = dbPromise;
  }

  async getCurrentProfile(): Promise<Profile | null> {
    const db = await this.dbPromise;
    const all = await db.getAll("profile");
    // Single-profile assumption lives here only: today there is at most one
    // local profile, so "current" means "the first (only) one on record".
    return all[0] ?? null;
  }

  async createProfile(input: CreateProfileInput): Promise<Profile> {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    const profile: Profile = {
      id: generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    await db.put("profile", profile);
    return profile;
  }

  async updateProfile(id: Id, patch: UpdateProfileInput): Promise<Profile> {
    const db = await this.dbPromise;
    const existing = await db.get("profile", id);
    if (!existing) {
      throw new Error(`Profile ${id} not found`);
    }
    const updated: Profile = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await db.put("profile", updated);
    return updated;
  }

  async clearProfile(id: Id): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(
      ["profile", "salaryEntries", "salaryHistory", "growthProjections"],
      "readwrite",
    );

    await tx.objectStore("profile").delete(id);

    const entryStore = tx.objectStore("salaryEntries");
    for (const entry of await entryStore.index("by-profileId").getAll(id)) {
      await entryStore.delete(entry.id);
    }

    const historyStore = tx.objectStore("salaryHistory");
    for (const entry of await historyStore.index("by-profileId").getAll(id)) {
      await historyStore.delete(entry.id);
    }

    const growthStore = tx.objectStore("growthProjections");
    for (const entry of await growthStore.index("by-profileId").getAll(id)) {
      await growthStore.delete(entry.id);
    }

    await tx.done;
  }
}
