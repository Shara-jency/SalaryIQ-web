import { beforeAll, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const mockFindUnique = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../_lib/prisma", () => ({
  prisma: {
    salaryEntry: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
});

function fakeResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
    setHeader() {
      return res;
    },
  };
  return res as unknown as VercelResponse & { statusCode: number; body: unknown };
}

function fakeRequest(token: string, id: string, method = "DELETE"): VercelRequest {
  return {
    method,
    headers: { authorization: `Bearer ${token}` },
    // Vercel gives catch-all segments as req.query.params: string[]
    query: { params: [id] },
  } as unknown as VercelRequest;
}

describe("DELETE /api/salary-entries/[...params] — cross-user isolation", () => {
  it("404s when the entry belongs to a different user", async () => {
    const { signAccessToken } = await import("../../_lib/auth");
    const handler = (await import("../[...params]")).default;

    mockFindUnique.mockResolvedValueOnce({ id: "entry-1", userId: "owner-user" });

    const token = signAccessToken("attacker-user", "attacker@example.com");
    const req = fakeRequest(token, "entry-1");
    const res = fakeResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("deletes the entry when the requester owns it", async () => {
    const { signAccessToken } = await import("../../_lib/auth");
    const handler = (await import("../[...params]")).default;

    mockFindUnique.mockResolvedValueOnce({ id: "entry-2", userId: "owner-user" });
    mockDelete.mockResolvedValueOnce({});

    const token = signAccessToken("owner-user", "owner@example.com");
    const req = fakeRequest(token, "entry-2");
    const res = fakeResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "entry-2" } });
  });
});
