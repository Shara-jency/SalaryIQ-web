import type { CreateGrowthProjectionInput, GrowthProjection, Id } from "../models";

export interface IGrowthProjectionRepository {
  list(profileId: Id): Promise<GrowthProjection[]>;
  getLatest(profileId: Id): Promise<GrowthProjection | null>;
  create(input: CreateGrowthProjectionInput): Promise<GrowthProjection>;
  update(
    id: Id,
    patch: Partial<CreateGrowthProjectionInput>,
  ): Promise<GrowthProjection>;
  delete(id: Id): Promise<void>;
}
