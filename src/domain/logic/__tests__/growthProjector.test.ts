import { describe, expect, it } from "vitest";
import { projectGrowth } from "../growthProjector";

describe("projectGrowth", () => {
  it("compounds year over year using each year's hike percentage", () => {
    const years = projectGrowth(1000000, [10, 10]);
    expect(years).toHaveLength(2);
    expect(years[0]).toEqual({ year: 1, projectedCtc: 1100000, hikePercentage: 10 });
    expect(years[1]).toEqual({ year: 2, projectedCtc: 1210000, hikePercentage: 10 });
  });

  it("returns an empty array for a non-positive starting CTC", () => {
    expect(projectGrowth(0, [10])).toEqual([]);
  });
});
