import type { ProjectedYear } from "../models";

/**
 * Compounds the current CTC year-over-year using a per-year hike percentage,
 * porting the projection logic that lived inline in the RN SalaryGrowthScreen.
 */
export function projectGrowth(currentCtc: number, hikePercentages: number[]): ProjectedYear[] {
  if (!Number.isFinite(currentCtc) || currentCtc <= 0) {
    return [];
  }

  const years: ProjectedYear[] = [];
  let runningCtc = currentCtc;

  hikePercentages.forEach((hikePercentage, index) => {
    const hike = Number.isFinite(hikePercentage) ? hikePercentage : 0;
    runningCtc = Math.round(runningCtc * (1 + hike / 100));
    years.push({
      year: index + 1,
      projectedCtc: runningCtc,
      hikePercentage: hike,
    });
  });

  return years;
}
