import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import { requireAuth, clearRefreshCookie } from "../_lib/auth.js";
import { badRequest, methodNotAllowed, withHandler } from "../_lib/respond.js";
import { toProfileDto } from "../_lib/mappers.js";

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { userId } = requireAuth(req);

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }
    res.status(200).json(toProfileDto(user));
    return;
  }

  if (req.method === "PATCH") {
    const { fullName, experienceYears, industry, currentRole, location } = req.body ?? {};

    if (experienceYears !== undefined) {
      const years = Number(experienceYears);
      if (!Number.isFinite(years) || years < 0 || years > 60) {
        badRequest("Please provide a valid experience between 0 and 60 years.");
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName !== undefined ? { fullName: String(fullName).trim() } : {}),
        ...(experienceYears !== undefined ? { experienceYears: Number(experienceYears) } : {}),
        ...(industry !== undefined ? { industry } : {}),
        ...(currentRole !== undefined ? { currentRole } : {}),
        ...(location !== undefined ? { location } : {}),
      },
    });

    res.status(200).json(toProfileDto(updated));
    return;
  }

  if (req.method === "DELETE") {
    await prisma.user.delete({ where: { id: userId } }); // cascades to all owned rows + refresh tokens
    clearRefreshCookie(res);
    res.status(200).json({ ok: true });
    return;
  }

  methodNotAllowed(res, ["GET", "PATCH", "DELETE"]);
});
