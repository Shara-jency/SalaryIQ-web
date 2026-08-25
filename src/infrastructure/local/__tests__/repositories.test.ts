import "./setup";
import { beforeEach, describe, expect, it } from "vitest";
import { getDb, resetDbForTests } from "../db";
import { LocalProfileRepository } from "../LocalProfileRepository";
import { LocalSalaryEntryRepository } from "../LocalSalaryEntryRepository";
import { LocalSalaryHistoryRepository } from "../LocalSalaryHistoryRepository";
import { LocalGrowthProjectionRepository } from "../LocalGrowthProjectionRepository";
import { LocalBenchmarkRepository } from "../LocalBenchmarkRepository";
import { indexedDB } from "fake-indexeddb";

beforeEach(async () => {
  // fresh IndexedDB + fresh cached connection per test
  await resetDbForTests();
  for (const dbInfo of await indexedDB.databases()) {
    if (dbInfo.name) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbInfo.name!);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => resolve();
      });
    }
  }
});

describe("LocalProfileRepository", () => {
  it("creates, reads, updates, and clears a profile plus its dependents", async () => {
    const dbPromise = getDb();
    const profileRepo = new LocalProfileRepository(dbPromise);
    const entryRepo = new LocalSalaryEntryRepository(dbPromise);

    expect(await profileRepo.getCurrentProfile()).toBeNull();

    const profile = await profileRepo.createProfile({
      fullName: "Asha Rao",
      experienceYears: 5,
      industry: "IT Services",
      currentRole: "Software Engineer",
      location: "Bangalore",
      currentCtc: 2000000,
    });

    expect(await profileRepo.getCurrentProfile()).toEqual(profile);

    const updated = await profileRepo.updateProfile(profile.id, { experienceYears: 6 });
    expect(updated.experienceYears).toBe(6);

    await entryRepo.create({
      profileId: profile.id,
      analysisFor: "self",
      jobTitle: "Software Engineer",
      experienceYears: 6,
      city: "Bangalore",
      industry: "IT Services",
      companyTier: "tier1",
      annualCtc: 2000000,
      taxRegime: "new",
      monthlyInHand: 150000,
      annualTax: 200000,
      hasEmployerPf: true,
    });
    expect(await entryRepo.list(profile.id)).toHaveLength(1);

    await profileRepo.clearProfile(profile.id);
    expect(await profileRepo.getCurrentProfile()).toBeNull();
    expect(await entryRepo.list(profile.id)).toHaveLength(0);
  });
});

describe("LocalSalaryHistoryRepository", () => {
  it("supports full CRUD", async () => {
    const repo = new LocalSalaryHistoryRepository(getDb());
    const created = await repo.create({
      profileId: "p1",
      year: 2023,
      annualCtc: 1500000,
    });

    expect(await repo.getById(created.id)).toEqual(created);

    const updated = await repo.update(created.id, { annualCtc: 1600000 });
    expect(updated.annualCtc).toBe(1600000);

    await repo.delete(created.id);
    expect(await repo.getById(created.id)).toBeNull();
  });

  it("lists entries ordered by year", async () => {
    const repo = new LocalSalaryHistoryRepository(getDb());
    await repo.create({ profileId: "p1", year: 2022, annualCtc: 1000000 });
    await repo.create({ profileId: "p1", year: 2021, annualCtc: 900000 });

    const list = await repo.list("p1");
    expect(list.map((e) => e.year)).toEqual([2021, 2022]);
  });
});

describe("LocalGrowthProjectionRepository", () => {
  it("creates and fetches the latest projection", async () => {
    const repo = new LocalGrowthProjectionRepository(getDb());
    await repo.create({ profileId: "p1", yearsToStay: 3, hikePercentages: [10, 10, 10] });
    const latest = await repo.getLatest("p1");
    expect(latest?.yearsToStay).toBe(3);
  });
});

describe("LocalBenchmarkRepository", () => {
  it("seeds once and matches a known job title/city", async () => {
    const repo = new LocalBenchmarkRepository(getDb());
    await repo.seedIfEmpty();
    const allAfterFirstSeed = await repo.findAll();
    expect(allAfterFirstSeed.length).toBeGreaterThan(50);

    await repo.seedIfEmpty(); // second call must be a no-op
    expect((await repo.findAll()).length).toBe(allAfterFirstSeed.length);

    const result = await repo.match({ jobTitle: "Software Engineer", city: "Bangalore", experienceYears: 3 });
    expect(result.matchType).toBe("exact");
    expect(result.benchmark.avgCtc).toBe(2500000);
  });
});
