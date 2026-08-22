import type {
  CreateSalaryHistoryInput,
  Id,
  SalaryHistoryEntry,
  UpdateSalaryHistoryInput,
} from "../models";

export interface ISalaryHistoryRepository {
  list(profileId: Id): Promise<SalaryHistoryEntry[]>;
  getById(id: Id): Promise<SalaryHistoryEntry | null>;
  create(input: CreateSalaryHistoryInput): Promise<SalaryHistoryEntry>;
  update(id: Id, patch: UpdateSalaryHistoryInput): Promise<SalaryHistoryEntry>;
  delete(id: Id): Promise<void>;
}
