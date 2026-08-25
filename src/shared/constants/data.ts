import type { CompanyTier, TaxRegime } from "@domain/models";

export const CITIES = [
  "Bangalore",
  "Mumbai",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Delhi",
  "Gurgaon",
  "Noida",
  "Kolkata",
  "Ahmedabad",
];

export const INDUSTRIES = [
  "IT Services",
  "Product",
  "FinTech",
  "Banking",
  "E-commerce",
  "Healthcare",
  "Telecom",
  "Consulting",
  "Automotive",
  "Government",
];

// Grouped by career ladder — engineering and QA both go Associate -> mid ->
// Senior -> Lead -> Associate Manager -> ... -> Senior Manager, so QA has the
// same progression options as engineering instead of one flat "QA Engineer".
export const JOB_TITLES = [
  // Engineering ladder
  "Associate Software Engineer",
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Tech Lead",
  // QA ladder
  "Associate QA Engineer",
  "QA Engineer",
  "Senior QA Engineer",
  "QA Lead",
  // Shared management ladder
  "Associate Manager",
  "Engineering Manager",
  "Senior Manager",
  // Other specialist roles
  "Product Manager",
  "Technical Program Manager",
  "Data Analyst",
  "Data Scientist",
  "Data Engineer",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Business Analyst",
];

export const COMPANY_TIERS: { value: CompanyTier; label: string }[] = [
  { value: "tier1", label: "Tier 1" },
  { value: "tier2", label: "Tier 2" },
  { value: "tier3", label: "Tier 3" },
];

export const TAX_REGIMES: { value: TaxRegime; label: string }[] = [
  { value: "new", label: "New" },
  { value: "old", label: "Old" },
];
