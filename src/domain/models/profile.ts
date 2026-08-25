import type { Id, ISODateString } from "./common";

export interface Profile {
  id: Id;
  fullName: string;
  email?: string;
  experienceYears: number;
  industry: string;
  currentRole: string;
  location: string;
  // The single source of truth for "current CTC" shown on Home/Growth —
  // directly editable here, and kept in sync when a self-analysis is saved
  // (see useSaveSalaryAnalysis), so it never depends on remembering to save.
  currentCtc: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateProfileInput {
  fullName: string;
  email?: string;
  experienceYears: number;
  industry: string;
  currentRole: string;
  location: string;
  currentCtc: number;
}

export type UpdateProfileInput = Partial<CreateProfileInput>;
