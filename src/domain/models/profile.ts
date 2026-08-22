import type { Id, ISODateString } from "./common";

export interface Profile {
  id: Id;
  fullName: string;
  email?: string;
  experienceYears: number;
  industry: string;
  currentRole: string;
  location: string;
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
}

export type UpdateProfileInput = Partial<CreateProfileInput>;
