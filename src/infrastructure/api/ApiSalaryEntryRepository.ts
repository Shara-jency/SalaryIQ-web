import type { ISalaryEntryRepository } from "@domain/repositories";
import type { CreateSalaryEntryInput, Id, SalaryEntry } from "@domain/models";
import type { HttpClient } from "./httpClient";

export class ApiSalaryEntryRepository implements ISalaryEntryRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // profileId is accepted-but-unused here: the server derives the acting
  // user from the JWT, never from a client-supplied id.
  async list(_profileId: Id): Promise<SalaryEntry[]> {
    return this.http.get<SalaryEntry[]>("/api/salary-entries");
  }

  async getById(id: Id): Promise<SalaryEntry | null> {
    const all = await this.list("");
    return all.find((entry) => entry.id === id) ?? null;
  }

  async getLatest(_profileId: Id): Promise<SalaryEntry | null> {
    return this.http.get<SalaryEntry | null>("/api/salary-entries/latest");
  }

  async create(input: CreateSalaryEntryInput): Promise<SalaryEntry> {
    return this.http.post<SalaryEntry>("/api/salary-entries", input);
  }

  async delete(id: Id): Promise<void> {
    await this.http.delete(`/api/salary-entries/${id}`);
  }
}
