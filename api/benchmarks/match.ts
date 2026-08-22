import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import { requireAuth } from "../_lib/auth.js";
import { badRequest, methodNotAllowed, withHandler } from "../_lib/respond.js";
import { toBenchmarkDto } from "../_lib/mappers.js";
import { matchBenchmark } from "../../src/domain/logic/benchmarkMatcher.js";

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  requireAuth(req);

  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }

  const { jobTitle, city, experienceYears } = req.body ?? {};
  if (typeof jobTitle !== "string" || !jobTitle.trim()) badRequest("jobTitle is required.");
  if (typeof city !== "string" || !city.trim()) badRequest("city is required.");

  const rows = await prisma.marketBenchmark.findMany();
  // Same pure function LocalBenchmarkRepository uses on the frontend — one
  // canonical implementation of the 4-stage matching algorithm.
  const result = matchBenchmark(
    { jobTitle, city, experienceYears: Number(experienceYears) || 0 },
    rows.map(toBenchmarkDto),
  );

  res.status(200).json(result);
});
