import type { IGrowthProjectionRepository } from "@domain/repositories";
import type { CreateGrowthProjectionInput, GrowthProjection, Id } from "@domain/models";
import type { HttpClient } from "./httpClient";

export class ApiGrowthProjectionRepository implements IGrowthProjectionRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async list(_profileId: Id): Promise<GrowthProjection[]> {
    return this.http.get<GrowthProjection[]>("/api/growth-projections");
  }

  async getLatest(_profileId: Id): Promise<GrowthProjection | null> {
    return this.http.get<GrowthProjection | null>("/api/growth-projections/latest");
  }

  async create(input: CreateGrowthProjectionInput): Promise<GrowthProjection> {
    return this.http.post<GrowthProjection>("/api/growth-projections", input);
  }

  async update(id: Id, patch: Partial<CreateGrowthProjectionInput>): Promise<GrowthProjection> {
    return this.http.patch<GrowthProjection>(`/api/growth-projections/${id}`, patch);
  }

  async delete(id: Id): Promise<void> {
    await this.http.delete(`/api/growth-projections/${id}`);
  }
}
