import { describe, expect, it } from "vitest";
import { matchBenchmark } from "../benchmarkMatcher";
import type { MarketBenchmark } from "../../models";

const benchmarks: MarketBenchmark[] = [
  { id: "1", jobTitle: "Software Engineer", city: "Bangalore", minCtc: 1000000, avgCtc: 2500000, maxCtc: 5000000 },
  { id: "2", jobTitle: "Product Manager", city: "Bangalore", minCtc: 1800000, avgCtc: 3500000, maxCtc: 7000000 },
  { id: "3", jobTitle: "Engineering Manager", city: "Bangalore", minCtc: 3000000, avgCtc: 6000000, maxCtc: 12000000 },
  { id: "4", jobTitle: "Senior Software Engineer", city: "Bangalore", minCtc: 2000000, avgCtc: 4000000, maxCtc: 8000000 },
  { id: "5", jobTitle: "QA Engineer", city: "Bangalore", minCtc: 600000, avgCtc: 1500000, maxCtc: 3000000 },
];

describe("matchBenchmark", () => {
  it("stage 1: exact title + city match", () => {
    const result = matchBenchmark(
      { jobTitle: "Software Engineer", city: "Bangalore", experienceYears: 3 },
      benchmarks,
    );
    expect(result.matchType).toBe("exact");
    expect(result.benchmark.id).toBe("1");
  });

  it("stage 2: partial match picks the longest containing title", () => {
    const result = matchBenchmark(
      { jobTitle: "Senior Product Manager", city: "Bangalore", experienceYears: 8 },
      benchmarks,
    );
    expect(result.matchType).toBe("partial");
    expect(result.matchedJobTitle).toBe("Product Manager");
  });

  it("stage 3: keyword inference maps Associate Manager to Engineering Manager", () => {
    const result = matchBenchmark(
      { jobTitle: "Associate Manager", city: "Bangalore", experienceYears: 6 },
      benchmarks,
    );
    expect(result.matchType).toBe("keyword");
    expect(result.matchedJobTitle).toBe("Engineering Manager");
  });

  it("stage 4: experience fallback to Senior Software Engineer at 7+ years", () => {
    const result = matchBenchmark(
      { jobTitle: "Widget Wrangler", city: "Bangalore", experienceYears: 9 },
      benchmarks,
    );
    expect(result.matchType).toBe("experience_fallback");
    expect(result.matchedJobTitle).toBe("Senior Software Engineer");
  });

  it("stage 4: QA keywords fall back to QA Engineer regardless of experience", () => {
    const result = matchBenchmark(
      { jobTitle: "SDET II", city: "Bangalore", experienceYears: 2 },
      benchmarks,
    );
    expect(result.matchedJobTitle).toBe("QA Engineer");
  });

  it("returns a zeroed benchmark when nothing matches at all", () => {
    const result = matchBenchmark(
      { jobTitle: "Astronaut", city: "Nowhere", experienceYears: 1 },
      [],
    );
    expect(result.matchType).toBe("none");
    expect(result.benchmark.avgCtc).toBe(0);
  });
});
