import type { IProfileRepository } from "@domain/repositories";
import type { CreateProfileInput, Id, Profile, UpdateProfileInput } from "@domain/models";
import type { HttpClient } from "./httpClient";

export class ApiProfileRepository implements IProfileRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getCurrentProfile(): Promise<Profile | null> {
    try {
      return await this.http.get<Profile>("/api/users/me");
    } catch {
      return null;
    }
  }

  // Registration happens through the auth endpoints (see AuthProvider), not
  // through this repository — there's no "create a profile" concept
  // separate from creating an account once auth is real.
  async createProfile(_input: CreateProfileInput): Promise<Profile> {
    throw new Error("Use auth.register() to create an account instead.");
  }

  async updateProfile(_id: Id, patch: UpdateProfileInput): Promise<Profile> {
    return this.http.patch<Profile>("/api/users/me", patch);
  }

  async clearProfile(_id: Id): Promise<void> {
    await this.http.delete("/api/users/me");
  }
}
