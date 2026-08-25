import type { User, SalaryEntry as DbSalaryEntry, SalaryHistoryEntry as DbSalaryHistoryEntry, GrowthProjection as DbGrowthProjection, MarketBenchmark as DbMarketBenchmark } from "../../generated/prisma/client.js";

// The frontend's domain models (src/domain/models/**) are the contract here —
// these mappers translate Prisma rows into exactly those shapes so
// Api*Repository classes can hand them straight to the UI unchanged.

export function toProfileDto(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    experienceYears: user.experienceYears,
    industry: user.industry,
    currentRole: user.currentRole,
    location: user.location,
    currentCtc: user.currentCtc,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toSalaryEntryDto(entry: DbSalaryEntry) {
  return {
    id: entry.id,
    profileId: entry.userId,
    analysisFor: entry.analysisFor as "self" | "someone_else",
    jobTitle: entry.jobTitle,
    experienceYears: entry.experienceYears,
    city: entry.city,
    industry: entry.industry,
    companyTier: entry.companyTier as "tier1" | "tier2" | "tier3",
    annualCtc: entry.annualCtc,
    monthlyInHandOverride: entry.monthlyInHandOverride ?? undefined,
    taxRegime: entry.taxRegime as "new" | "old",
    monthlyInHand: entry.monthlyInHand,
    annualTax: entry.annualTax,
    createdAt: entry.createdAt.toISOString(),
  };
}

export function toSalaryHistoryDto(entry: DbSalaryHistoryEntry) {
  return {
    id: entry.id,
    profileId: entry.userId,
    year: entry.year,
    annualCtc: entry.annualCtc,
    monthlyInHand: entry.monthlyInHand ?? undefined,
    jobTitle: entry.jobTitle ?? undefined,
    company: entry.company ?? undefined,
    notes: entry.notes ?? undefined,
    createdAt: entry.createdAt.toISOString(),
  };
}

export function toGrowthProjectionDto(entry: DbGrowthProjection) {
  return {
    id: entry.id,
    profileId: entry.userId,
    salaryEntryId: entry.salaryEntryId ?? undefined,
    yearsToStay: entry.yearsToStay,
    hikePercentages: entry.hikePercentages,
    createdAt: entry.createdAt.toISOString(),
  };
}

export function toBenchmarkDto(row: DbMarketBenchmark) {
  return {
    id: row.id,
    jobTitle: row.jobTitle,
    city: row.city,
    minCtc: row.minCtc,
    avgCtc: row.avgCtc,
    maxCtc: row.maxCtc,
  };
}
