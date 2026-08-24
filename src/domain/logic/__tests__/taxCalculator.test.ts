import { describe, expect, it } from "vitest";
import { calculateInHandSalary, getSalaryBreakdown } from "../taxCalculator";

// EPF: basic pay is assumed to be 40% of CTC, and both employee/employer
// contribute 12% of basic capped at the ₹15,000/month (₹1,80,000/year)
// EPFO wage ceiling — see taxCalculator.ts. For every case below, basic
// exceeds the ceiling, so both PF contributions are pinned at
// 1,80,000 * 0.12 = 21,600/year.
const EPF_CONTRIBUTION = 21600;

describe("calculateInHandSalary", () => {
  it("returns zero tax under the new-regime 87A rebate threshold, but still deducts EPF", () => {
    const result = calculateInHandSalary(1200000, "new");
    expect(result.annualTax).toBe(0);
    // Gross salary = 12,00,000 - 21,600 employer PF = 11,78,400
    // In-hand = gross - employee PF - tax = 11,78,400 - 21,600 - 0 = 11,56,800
    expect(result.monthlyInHand).toBe(Math.round(1156800 / 12));
  });

  it("matches the RN app's known output for a 18L new-regime CTC, net of EPF", () => {
    // Gross salary = 18,00,000 - 21,600 employer PF = 17,78,400
    // Taxable income = 17,78,400 - 75,000 standard deduction = 17,03,400
    // Slab tax: 120,000 + (17,03,400-16,00,000)*0.20 = 140,680; *1.04 cess = 146,307.2 -> 146,307
    const result = calculateInHandSalary(1800000, "new");
    expect(result.annualTax).toBe(146307);
    expect(result.monthlyInHand).toBe(Math.round((1778400 - EPF_CONTRIBUTION - 146307) / 12));
  });

  it("applies the old-regime 87A rebate under 5L taxable income", () => {
    const result = calculateInHandSalary(500000, "old");
    expect(result.annualTax).toBe(0);
  });

  it("returns zeros for non-positive CTC", () => {
    expect(calculateInHandSalary(0, "new")).toEqual({
      monthlyInHand: 0,
      takeHomePercentage: 0,
      annualTax: 0,
    });
  });
});

describe("getSalaryBreakdown", () => {
  it("computes consistent monthly figures from annual figures", () => {
    const breakdown = getSalaryBreakdown(1800000, "old");
    expect(breakdown.monthlyCTC).toBe(Math.round(1800000 / 12));
    expect(breakdown.employerPF).toBe(EPF_CONTRIBUTION);
    expect(breakdown.employeePF).toBe(EPF_CONTRIBUTION);
    expect(breakdown.grossSalary).toBe(breakdown.annualCTC - breakdown.employerPF);
    expect(breakdown.annualInHand).toBe(breakdown.grossSalary - breakdown.employeePF - breakdown.annualTax);
  });
});
