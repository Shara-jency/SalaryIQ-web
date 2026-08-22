import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import { requireAuth } from "../_lib/auth.js";
import { badRequest, methodNotAllowed, withHandler } from "../_lib/respond.js";
import { toGrowthProjectionDto } from "../_lib/mappers.js";

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { userId } = requireAuth(req);

  if (req.method === "GET") {
    const entries = await prisma.growthProjection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(entries.map(toGrowthProjectionDto));
    return;
  }

  if (req.method === "POST") {
    const { salaryEntryId, yearsToStay, hikePercentages } = req.body ?? {};

    const years = Number(yearsToStay);
    if (!Number.isFinite(years) || years < 1 || years > 10) {
      badRequest("Years to stay must be between 1 and 10.");
    }
    if (!Array.isArray(hikePercentages) || hikePercentages.length !== years) {
      badRequest("hikePercentages must have one entry per year.");
    }

    // Ownership check on the optional linked entry — never trust a client-
    // supplied id to point at another user's row.
    if (salaryEntryId) {
      const linkedEntry = await prisma.salaryEntry.findUnique({ where: { id: salaryEntryId } });
      if (!linkedEntry || linkedEntry.userId !== userId) {
        badRequest("Invalid salaryEntryId.");
      }
    }

    const entry = await prisma.growthProjection.create({
      data: {
        userId,
        salaryEntryId: salaryEntryId ?? null,
        yearsToStay: years,
        hikePercentages: hikePercentages.map((h: unknown) => Number(h) || 0),
      },
    });

    res.status(201).json(toGrowthProjectionDto(entry));
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
});
