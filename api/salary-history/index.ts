import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import { requireAuth } from "../_lib/auth.js";
import { badRequest, methodNotAllowed, withHandler } from "../_lib/respond.js";
import { toSalaryHistoryDto } from "../_lib/mappers.js";

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { userId } = requireAuth(req);

  if (req.method === "GET") {
    const entries = await prisma.salaryHistoryEntry.findMany({
      where: { userId },
      orderBy: [{ year: "asc" }, { createdAt: "asc" }],
    });
    res.status(200).json(entries.map(toSalaryHistoryDto));
    return;
  }

  if (req.method === "POST") {
    const { year, annualCtc, monthlyInHand, jobTitle, company, notes } = req.body ?? {};

    const yearNum = Number(year);
    if (!Number.isFinite(yearNum) || yearNum < 1990 || yearNum > 2100) {
      badRequest("Please provide a valid year.");
    }
    const ctc = Number(annualCtc);
    if (!Number.isFinite(ctc) || ctc <= 0) badRequest("Please provide a valid annual CTC.");

    const entry = await prisma.salaryHistoryEntry.create({
      data: {
        userId,
        year: yearNum,
        annualCtc: ctc,
        monthlyInHand: monthlyInHand !== undefined && monthlyInHand !== null ? Number(monthlyInHand) : null,
        jobTitle: jobTitle ? String(jobTitle).trim() : null,
        company: company ? String(company).trim() : null,
        notes: notes ? String(notes).trim() : null,
      },
    });

    res.status(201).json(toSalaryHistoryDto(entry));
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
});
