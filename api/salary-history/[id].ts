import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import { requireAuth } from "../_lib/auth.js";
import { methodNotAllowed, withHandler } from "../_lib/respond.js";
import { toSalaryHistoryDto } from "../_lib/mappers.js";

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { userId } = requireAuth(req);
  const id = String(req.query.id);

  const existing = await prisma.salaryHistoryEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: "Salary history entry not found." });
    return;
  }

  if (req.method === "PATCH") {
    const { year, annualCtc, monthlyInHand, jobTitle, company, notes } = req.body ?? {};

    const updated = await prisma.salaryHistoryEntry.update({
      where: { id },
      data: {
        ...(year !== undefined ? { year: Number(year) } : {}),
        ...(annualCtc !== undefined ? { annualCtc: Number(annualCtc) } : {}),
        ...(monthlyInHand !== undefined ? { monthlyInHand: monthlyInHand === null ? null : Number(monthlyInHand) } : {}),
        ...(jobTitle !== undefined ? { jobTitle: jobTitle ? String(jobTitle).trim() : null } : {}),
        ...(company !== undefined ? { company: company ? String(company).trim() : null } : {}),
        ...(notes !== undefined ? { notes: notes ? String(notes).trim() : null } : {}),
      },
    });

    res.status(200).json(toSalaryHistoryDto(updated));
    return;
  }

  if (req.method === "DELETE") {
    await prisma.salaryHistoryEntry.delete({ where: { id } });
    res.status(200).json({ ok: true });
    return;
  }

  methodNotAllowed(res, ["PATCH", "DELETE"]);
});
