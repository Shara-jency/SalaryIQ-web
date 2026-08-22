import type { Id, ISODateString } from "./common";

export interface SalaryHistoryEntry {
  id: Id;
  profileId: Id;
  year: number;
  annualCtc: number;
  monthlyInHand?: number;
  jobTitle?: string;
  company?: string;
  notes?: string;
  createdAt: ISODateString;
}

export type CreateSalaryHistoryInput = Omit<SalaryHistoryEntry, "id" | "createdAt">;
export type UpdateSalaryHistoryInput = Partial<CreateSalaryHistoryInput>;
