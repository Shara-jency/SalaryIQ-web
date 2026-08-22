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

export const JOB_TITLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Tech Lead",
  "Engineering Manager",
  "Product Manager",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "QA Engineer",
  "UI/UX Designer",
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
