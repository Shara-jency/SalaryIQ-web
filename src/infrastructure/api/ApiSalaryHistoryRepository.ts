import type { ISalaryHistoryRepository } from "@domain/repositories";
import type {
  CreateSalaryHistoryInput,
  Id,
  SalaryHistoryEntry,
  UpdateSalaryHistoryInput,
} from "@domain/models";
import type { HttpClient } from "./httpClient";

export class ApiSalaryHistoryRepository implements ISalaryHistoryRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async list(_profileId: Id): Promise<SalaryHistoryEntry[]> {
    return this.http.get<SalaryHistoryEntry[]>("/api/salary-history");
  }

  async getById(id: Id): Promise<SalaryHistoryEntry | null> {
    const all = await this.list("");
    return all.find((entry) => entry.id === id) ?? null;
  }

  async create(input: CreateSalaryHistoryInput): Promise<SalaryHistoryEntry> {
    return this.http.post<SalaryHistoryEntry>("/api/salary-history", input);
  }

  async update(id: Id, patch: UpdateSalaryHistoryInput): Promise<SalaryHistoryEntry> {
    return this.http.patch<SalaryHistoryEntry>(`/api/salary-history/${id}`, patch);
  }

  async delete(id: Id): Promise<void> {
    await this.http.delete(`/api/salary-history/${id}`);
  }
}
