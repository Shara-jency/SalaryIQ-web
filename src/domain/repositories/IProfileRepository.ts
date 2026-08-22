import type { CreateProfileInput, Id, Profile, UpdateProfileInput } from "../models";

/**
 * getCurrentProfile() is the one seam that hides the "single local profile,
 * no auth yet" assumption. Every other repository takes a profileId explicitly
 * so multi-profile/auth support can be added later without touching them.
 */
export interface IProfileRepository {
  getCurrentProfile(): Promise<Profile | null>;
  createProfile(input: CreateProfileInput): Promise<Profile>;
  updateProfile(id: Id, patch: UpdateProfileInput): Promise<Profile>;
  clearProfile(id: Id): Promise<void>;
}
