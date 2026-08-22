import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import { requireAuth } from "../_lib/auth.js";
import { methodNotAllowed, withHandler } from "../_lib/respond.js";
import { toSalaryEntryDto } from "../_lib/mappers.js";

// Combines the old latest.ts (/api/salary-entries/latest) and [id].ts
// (/api/salary-entries/:id) into one function — see api/auth/[...action].ts
// for why (Vercel's Hobby-plan 12-function cap). URLs are unchanged.

async function getLatest(userId: string, res: VercelResponse) {
  const entry = await prisma.salaryEntry.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(entry ? toSalaryEntryDto(entry) : null);
}

async function deleteById(userId: string, id: string, res: VercelResponse) {
  const entry = await prisma.salaryEntry.findUnique({ where: { id } });
  // 404 (not 403) whether the row is missing or owned by someone else, so
  // this endpoint never confirms another user's row exists.
  if (!entry || entry.userId !== userId) {
    res.status(404).json({ error: "Salary entry not found." });
    return;
  }
  await prisma.salaryEntry.delete({ where: { id } });
  res.status(200).json({ ok: true });
}

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { userId } = requireAuth(req);

  const segments = req.query.params;
  const [first] = Array.isArray(segments) ? segments : segments ? [segments] : [];

  if (first === "latest") {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
    await getLatest(userId, res);
    return;
  }

  if (first) {
    if (req.method !== "DELETE") return methodNotAllowed(res, ["DELETE"]);
    await deleteById(userId, first, res);
    return;
  }

  res.status(404).json({ error: "Not found." });
});
