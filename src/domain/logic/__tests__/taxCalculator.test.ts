import { describe, expect, it } from "vitest";
import { calculateInHandSalary, getSalaryBreakdown } from "../taxCalculator";

describe("calculateInHandSalary", () => {
  it("returns zero tax under the new-regime 87A rebate threshold", () => {
    const result = calculateInHandSalary(1200000, "new");
    expect(result.annualTax).toBe(0);
    expect(result.monthlyInHand).toBe(100000);
  });

  it("matches the RN app's known output for a 18L new-regime CTC", () => {
    // Taxable income = 1,800,000 - 75,000 = 1,725,000
    // Slab tax: 120,000 + (1,725,000-1,600,000)*0.20 = 145,000; *1.04 cess = 150,800
    const result = calculateInHandSalary(1800000, "new");
    expect(result.annualTax).toBe(150800);
    expect(result.monthlyInHand).toBe(Math.round((1800000 - 150800) / 12));
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
    expect(breakdown.annualInHand).toBe(breakdown.annualCTC - breakdown.annualTax);
  });
});
