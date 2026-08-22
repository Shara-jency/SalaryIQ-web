import type { CreateSalaryEntryInput, Id, SalaryEntry } from "../models";

export interface ISalaryEntryRepository {
  list(profileId: Id): Promise<SalaryEntry[]>;
  getById(id: Id): Promise<SalaryEntry | null>;
  getLatest(profileId: Id): Promise<SalaryEntry | null>;
  create(input: CreateSalaryEntryInput): Promise<SalaryEntry>;
  delete(id: Id): Promise<void>;
}
