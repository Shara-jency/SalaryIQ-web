import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import { requireAuth } from "../_lib/auth.js";
import { methodNotAllowed, withHandler } from "../_lib/respond.js";
import { toBenchmarkDto } from "../_lib/mappers.js";

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  requireAuth(req);

  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const city = typeof req.query.city === "string" ? req.query.city : undefined;

  const rows = await prisma.marketBenchmark.findMany({
    where: city ? { city } : undefined,
  });

  res.status(200).json(rows.map(toBenchmarkDto));
});
