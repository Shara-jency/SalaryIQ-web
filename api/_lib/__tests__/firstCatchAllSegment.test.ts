import { describe, expect, it } from "vitest";
import type { VercelRequest } from "@vercel/node";
import { firstCatchAllSegment } from "../respond";

function fakeReq(query: Record<string, unknown>): VercelRequest {
  return { query } as unknown as VercelRequest;
}

describe("firstCatchAllSegment", () => {
  it("reads Vercel's actual non-Next.js shape: a plain string under the literal '...name' key", () => {
    // This is the real shape observed in production for api/auth/[...action].ts
    // — Vercel's plain Node.js runtime keeps the ellipsis in the query key and
    // gives a single "/"-joined string, unlike Next.js's array-under-bare-key.
    expect(firstCatchAllSegment(fakeReq({ "...action": "register" }), "action")).toBe("register");
  });

  it("splits a multi-segment '/'-joined string and returns the first part", () => {
    expect(firstCatchAllSegment(fakeReq({ "...params": "abc123/extra" }), "params")).toBe("abc123");
  });

  it("also supports the Next.js-style array-under-bare-key shape", () => {
    expect(firstCatchAllSegment(fakeReq({ params: ["latest"] }), "params")).toBe("latest");
  });

  it("returns undefined when the segment is entirely absent", () => {
    expect(firstCatchAllSegment(fakeReq({}), "action")).toBeUndefined();
  });
});
