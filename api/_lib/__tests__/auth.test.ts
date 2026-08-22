import { beforeAll, describe, expect, it } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  verifyPassword,
  hashToken,
} from "../auth";
import { HttpError } from "../respond";

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
});

describe("access tokens", () => {
  it("round-trips userId and email", () => {
    const token = signAccessToken("user-1", "asha@example.com");
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.email).toBe("asha@example.com");
    expect(payload.type).toBe("access");
  });

  it("rejects a refresh token presented as an access token", () => {
    const refreshToken = signRefreshToken("user-1");
    expect(() => verifyAccessToken(refreshToken)).toThrow(HttpError);
  });

  it("rejects a garbage token", () => {
    expect(() => verifyAccessToken("not-a-jwt")).toThrow(HttpError);
  });
});

describe("refresh tokens", () => {
  it("round-trips userId", () => {
    const token = signRefreshToken("user-42");
    expect(verifyRefreshToken(token).sub).toBe("user-42");
  });

  it("rejects an access token presented as a refresh token", () => {
    const accessToken = signAccessToken("user-42", "x@example.com");
    expect(() => verifyRefreshToken(accessToken)).toThrow(HttpError);
  });
});

describe("password hashing", () => {
  it("verifies a correct password and rejects an incorrect one", async () => {
    const hash = await hashPassword("correct-password-123");
    expect(await verifyPassword("correct-password-123", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});

describe("hashToken", () => {
  it("is deterministic and distinguishes different inputs", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });
});
