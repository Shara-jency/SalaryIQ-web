import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import { requireAuth } from "../_lib/auth.js";
import { badRequest, firstCatchAllSegment, methodNotAllowed, withHandler } from "../_lib/respond.js";
import { toGrowthProjectionDto } from "../_lib/mappers.js";

// Combines the old latest.ts and [id].ts into one function — see
// api/auth/[...action].ts for why. URLs are unchanged.

async function getLatest(userId: string, res: VercelResponse) {
  const entry = await prisma.growthProjection.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(entry ? toGrowthProjectionDto(entry) : null);
}

async function handleById(req: VercelRequest, res: VercelResponse, userId: string, id: string) {
  const existing = await prisma.growthProjection.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: "Growth projection not found." });
    return;
  }

  if (req.method === "PATCH") {
    const { yearsToStay, hikePercentages } = req.body ?? {};

    if (yearsToStay !== undefined) {
      const years = Number(yearsToStay);
      if (!Number.isFinite(years) || years < 1 || years > 10) {
        badRequest("Years to stay must be between 1 and 10.");
      }
    }

    const updated = await prisma.growthProjection.update({
      where: { id },
      data: {
        ...(yearsToStay !== undefined ? { yearsToStay: Number(yearsToStay) } : {}),
        ...(hikePercentages !== undefined
          ? { hikePercentages: (hikePercentages as unknown[]).map((h) => Number(h) || 0) }
          : {}),
      },
    });

    res.status(200).json(toGrowthProjectionDto(updated));
    return;
  }

  if (req.method === "DELETE") {
    await prisma.growthProjection.delete({ where: { id } });
    res.status(200).json({ ok: true });
    return;
  }

  methodNotAllowed(res, ["PATCH", "DELETE"]);
}

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { userId } = requireAuth(req);

  const first = firstCatchAllSegment(req, "params");

  if (first === "latest") {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
    await getLatest(userId, res);
    return;
  }

  if (first) {
    await handleById(req, res, userId, first);
    return;
  }

  res.status(404).json({ error: "Not found." });
});
