import "dotenv/config";
import { prisma } from "../api/_lib/prisma.js";
import benchmarkSeedRows from "../src/infrastructure/local/seed/marketBenchmarks.seed.json" with { type: "json" };

type SeedRow = { jobTitle: string; city: string; minCtc: number; avgCtc: number; maxCtc: number };

async function main() {
  const existingCount = await prisma.marketBenchmark.count();
  if (existingCount >= (benchmarkSeedRows as SeedRow[]).length) {
    console.log(`market_benchmarks already has ${existingCount} rows — skipping seed.`);
    return;
  }

  console.log(`Seeding ${(benchmarkSeedRows as SeedRow[]).length} market benchmark rows...`);
  for (const row of benchmarkSeedRows as SeedRow[]) {
    // No natural unique key on (jobTitle, city) in the schema, so look the
    // pair up first and create/update explicitly rather than relying on a
    // composite unique constraint that isn't otherwise needed.
    const existing = await prisma.marketBenchmark.findFirst({
      where: { jobTitle: row.jobTitle, city: row.city },
      select: { id: true },
    });

    if (existing) {
      await prisma.marketBenchmark.update({
        where: { id: existing.id },
        data: { minCtc: row.minCtc, avgCtc: row.avgCtc, maxCtc: row.maxCtc },
      });
    } else {
      await prisma.marketBenchmark.create({ data: row });
    }
  }
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
