import { describe, expect, it, vi } from "vitest";

const mockDeleteMany = vi.fn().mockResolvedValue({ count: 0 });
const mockCount = vi.fn();
const mockCreate = vi.fn().mockResolvedValue({});

vi.mock("../prisma", () => ({
  prisma: {
    rateLimitAttempt: {
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

describe("enforceRateLimit", () => {
  it("allows the request and records it when under the limit", async () => {
    const { enforceRateLimit } = await import("../rateLimit");
    mockCount.mockResolvedValueOnce(2);

    await enforceRateLimit("login:ip:1.2.3.4", 5, 60_000);

    expect(mockCreate).toHaveBeenCalledWith({ data: { key: "login:ip:1.2.3.4" } });
  });

  it("throws HttpError(429) at the limit and does not record another attempt", async () => {
    const { enforceRateLimit } = await import("../rateLimit");
    const { HttpError } = await import("../respond");
    mockCreate.mockClear();
    mockCount.mockResolvedValueOnce(5);

    await expect(enforceRateLimit("login:ip:1.2.3.4", 5, 60_000)).rejects.toThrow(HttpError);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
