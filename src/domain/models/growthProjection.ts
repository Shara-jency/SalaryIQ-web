import type { Id, ISODateString } from "./common";

export interface GrowthProjection {
  id: Id;
  profileId: Id;
  salaryEntryId?: Id;
  yearsToStay: number;
  hikePercentages: number[];
  createdAt: ISODateString;
}

export type CreateGrowthProjectionInput = Omit<GrowthProjection, "id" | "createdAt">;

export interface ProjectedYear {
  year: number;
  projectedCtc: number;
  hikePercentage: number;
}
