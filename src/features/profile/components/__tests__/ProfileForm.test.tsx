import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileForm } from "../ProfileForm";
import type { Profile } from "@domain/models";

const FRESH_PROFILE: Profile = {
  id: "p1",
  fullName: "Flow Test",
  experienceYears: 0,
  // Exactly what a freshly-registered profile looks like — empty strings,
  // not null/undefined (see prisma/schema.prisma defaults).
  industry: "",
  currentRole: "",
  location: "",
  currentCtc: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("ProfileForm — fresh (post-registration) profile", () => {
  it("submits real default values, not empty strings, when the selects are left untouched", () => {
    const onSubmit = vi.fn();
    render(<ProfileForm initial={FRESH_PROFILE} submitLabel="Continue" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.industry).not.toBe("");
    expect(submitted.currentRole).not.toBe("");
    expect(submitted.location).not.toBe("");
  });
});
