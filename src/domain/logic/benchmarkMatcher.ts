import type {
  BenchmarkMatchCriteria,
  BenchmarkMatchResult,
  MarketBenchmark,
} from "../models";

/**
 * 4-stage benchmark matching, ported from the RN app's salaryQueries.ts
 * (there it was implemented as SQL; here it operates on an in-memory array
 * so any repository implementation — local or API — can reuse it).
 *
 * 1. Exact job title + city match
 * 2. Partial match: user title contains a benchmark title (longest wins)
 * 3. Keyword inference (e.g. "ML Engineer" -> "Machine Learning Engineer")
 * 4. Experience-based fallback (QA keywords -> QA Engineer; 7+ yrs -> Senior
 *    Software Engineer; otherwise -> Software Engineer)
 * Each stage tries the same city first, then falls back to any city.
 */

function inferBenchmarkTitle(title: string): string | null {
  const t = title.toLowerCase();

  if (t.includes("product") && t.includes("manager")) return "Product Manager";
  if (t.includes("engineering") && (t.includes("manager") || t.includes("lead") || t.includes("head")))
    return "Engineering Manager";
  if (t.includes("manager") || t.includes("lead") || t.includes("head of"))
    return "Engineering Manager";
  if (t.includes("machine learning") || t.includes("ml engineer") || t.includes("ai engineer"))
    return "Machine Learning Engineer";
  if (t.includes("data") && t.includes("scientist")) return "Data Scientist";
  if (t.includes("data") && t.includes("engineer")) return "Data Engineer";
  if (t.includes("data") && t.includes("analyst")) return "Data Analyst";
  if (t.includes("devops") || t.includes("sre") || t.includes("platform engineer") || t.includes("infrastructure"))
    return "DevOps Engineer";
  if (
    t.includes("frontend") ||
    t.includes("front-end") ||
    t.includes("front end") ||
    t.includes("react developer") ||
    t.includes("angular") ||
    t.includes("vue developer")
  )
    return "Frontend Developer";
  if (
    t.includes("backend") ||
    t.includes("back-end") ||
    t.includes("back end") ||
    t.includes("node developer") ||
    t.includes("java developer") ||
    t.includes("python developer")
  )
    return "Backend Developer";
  if (t.includes("full stack") || t.includes("fullstack") || t.includes("full-stack"))
    return "Full Stack Developer";
  if (t.includes("qa") || t.includes("quality assurance") || t.includes("sdet") || t.includes("test engineer"))
    return "QA Engineer";
  if (t.includes("ui") || t.includes("ux") || t.includes("design")) return "UI/UX Designer";
  if (t.includes("business analyst") || t.includes("system analyst")) return "Business Analyst";
  if (t.includes("senior") && (t.includes("engineer") || t.includes("developer")))
    return "Senior Software Engineer";
  if (t.includes("software") || t.includes("engineer") || t.includes("developer"))
    return "Software Engineer";
  if (t.includes("analyst")) return "Data Analyst";

  return null;
}

function findExact(benchmarks: MarketBenchmark[], jobTitle: string, city: string): MarketBenchmark | null {
  return (
    benchmarks.find(
      (b) => b.jobTitle.toLowerCase() === jobTitle.toLowerCase() && b.city.toLowerCase() === city.toLowerCase(),
    ) ?? null
  );
}

function findByTitleAnyCity(benchmarks: MarketBenchmark[], jobTitle: string): MarketBenchmark | null {
  return benchmarks.find((b) => b.jobTitle.toLowerCase() === jobTitle.toLowerCase()) ?? null;
}

export function matchBenchmark(
  criteria: BenchmarkMatchCriteria,
  benchmarks: MarketBenchmark[],
): BenchmarkMatchResult {
  const title = criteria.jobTitle.trim();
  const city = criteria.city.trim();

  // 1. Exact match
  const exact = findExact(benchmarks, title, city);
  if (exact) {
    return { benchmark: exact, matchType: "exact", matchedJobTitle: exact.jobTitle };
  }

  // 2. Partial match: user title contains a benchmark title (longest wins), same city
  const partial = benchmarks
    .filter((b) => b.city.toLowerCase() === city.toLowerCase() && title.toLowerCase().includes(b.jobTitle.toLowerCase()))
    .sort((a, b) => b.jobTitle.length - a.jobTitle.length)[0];
  if (partial) {
    return { benchmark: partial, matchType: "partial", matchedJobTitle: partial.jobTitle };
  }

  // 3. Keyword inference -> same city, then any city
  const inferred = inferBenchmarkTitle(title);
  if (inferred) {
    const byCity = findExact(benchmarks, inferred, city);
    if (byCity) {
      return { benchmark: byCity, matchType: "keyword", matchedJobTitle: byCity.jobTitle };
    }
    const anyCity = findByTitleAnyCity(benchmarks, inferred);
    if (anyCity) {
      return { benchmark: anyCity, matchType: "keyword", matchedJobTitle: anyCity.jobTitle };
    }
  }

  // 4. Experience-based fallback -> same city, then any city
  const t = title.toLowerCase();
  const isQaRole = t.includes("qa") || t.includes("test") || t.includes("quality");
  const fallbackTitle = isQaRole
    ? "QA Engineer"
    : criteria.experienceYears >= 7
      ? "Senior Software Engineer"
      : "Software Engineer";

  const fallbackByCity = findExact(benchmarks, fallbackTitle, city);
  if (fallbackByCity) {
    return { benchmark: fallbackByCity, matchType: "experience_fallback", matchedJobTitle: fallbackByCity.jobTitle };
  }

  const fallbackAnyCity = findByTitleAnyCity(benchmarks, fallbackTitle);
  if (fallbackAnyCity) {
    return { benchmark: fallbackAnyCity, matchType: "experience_fallback", matchedJobTitle: fallbackAnyCity.jobTitle };
  }

  return {
    benchmark: { id: "none", jobTitle: title, city, minCtc: 0, avgCtc: 0, maxCtc: 0 },
    matchType: "none",
    matchedJobTitle: title,
  };
}
