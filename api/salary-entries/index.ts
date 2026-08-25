import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import { requireAuth } from "../_lib/auth.js";
import { badRequest, methodNotAllowed, withHandler } from "../_lib/respond.js";
import { toSalaryEntryDto } from "../_lib/mappers.js";
import { calculateInHandSalary } from "../../src/domain/logic/taxCalculator.js";
import type { AnalysisFor, CompanyTier, TaxRegime } from "../../src/domain/models/salaryEntry.js";

const ANALYSIS_FOR_VALUES: AnalysisFor[] = ["self", "someone_else"];
const TAX_REGIME_VALUES: TaxRegime[] = ["new", "old"];
const COMPANY_TIER_VALUES: CompanyTier[] = ["tier1", "tier2", "tier3"];

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { userId } = requireAuth(req);

  if (req.method === "GET") {
    const entries = await prisma.salaryEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(entries.map(toSalaryEntryDto));
    return;
  }

  if (req.method === "POST") {
    const {
      analysisFor,
      jobTitle,
      experienceYears,
      city,
      industry,
      companyTier,
      annualCtc,
      monthlyInHandOverride,
      taxRegime,
      hasEmployerPf,
    } = req.body ?? {};

    if (!ANALYSIS_FOR_VALUES.includes(analysisFor)) badRequest("Invalid analysisFor.");
    if (typeof jobTitle !== "string" || !jobTitle.trim()) badRequest("Job title is required.");
    if (typeof city !== "string" || !city.trim()) badRequest("City is required.");
    if (typeof industry !== "string" || !industry.trim()) badRequest("Industry is required.");
    if (!COMPANY_TIER_VALUES.includes(companyTier)) badRequest("Invalid company tier.");
    if (!TAX_REGIME_VALUES.includes(taxRegime)) badRequest("Invalid tax regime.");

    const ctc = Number(annualCtc);
    if (!Number.isFinite(ctc) || ctc <= 0) badRequest("Please provide a valid annual CTC.");

    const years = Number(experienceYears);
    if (!Number.isFinite(years) || years < 0 || years > 60) {
      badRequest("Please provide a valid experience between 0 and 60 years.");
    }

    // Tax figures are always computed server-side from the CTC/regime — the
    // client never gets to dictate the canonical tax numbers, only the
    // optional monthly-in-hand override (a user-entered real figure, not a
    // computed one). `hasEmployerPf` is an input fact about the user's CTC
    // structure (like taxRegime), not a computed figure, so it's fine to
    // take from the client; it defaults to true (employer PF included).
    const taxResult = calculateInHandSalary(ctc, taxRegime, hasEmployerPf !== false);
    const override =
      monthlyInHandOverride !== undefined && monthlyInHandOverride !== null
        ? Number(monthlyInHandOverride)
        : undefined;

    const entry = await prisma.salaryEntry.create({
      data: {
        userId,
        analysisFor,
        jobTitle: jobTitle.trim(),
        experienceYears: years,
        city: city.trim(),
        industry: industry.trim(),
        companyTier,
        annualCtc: ctc,
        monthlyInHandOverride: override,
        taxRegime,
        monthlyInHand: override ?? taxResult.monthlyInHand,
        annualTax: taxResult.annualTax,
      },
    });

    res.status(201).json(toSalaryEntryDto(entry));
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
});
