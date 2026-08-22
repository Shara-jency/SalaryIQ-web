import type { TaxRegime } from "../models";

/**
 * FY 2025-26 India tax rules, ported from the RN app's salaryEngine.ts.
 * New regime: Section 87A rebate makes tax zero up to 12,00,000 taxable income.
 * Old regime: Section 87A rebate up to 12,500 if taxable income <= 5,00,000.
 */

const STANDARD_DEDUCTION_NEW = 75000;
const STANDARD_DEDUCTION_OLD = 50000;

export interface InHandResult {
  monthlyInHand: number;
  takeHomePercentage: number;
  annualTax: number;
}

export interface SalaryBreakdown {
  annualCTC: number;
  standardDeduction: number;
  taxableIncome: number;
  annualTax: number;
  annualInHand: number;
  monthlyCTC: number;
  monthlyTax: number;
  monthlyInHand: number;
  taxPercentage: number;
  takeHomePercentage: number;
}

function calculateNewRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 1200000) return 0;

  let tax = 0;
  if (taxableIncome <= 400000) {
    tax = 0;
  } else if (taxableIncome <= 800000) {
    tax = (taxableIncome - 400000) * 0.05;
  } else if (taxableIncome <= 1200000) {
    tax = 20000 + (taxableIncome - 800000) * 0.1;
  } else if (taxableIncome <= 1600000) {
    tax = 60000 + (taxableIncome - 1200000) * 0.15;
  } else if (taxableIncome <= 2000000) {
    tax = 120000 + (taxableIncome - 1600000) * 0.2;
  } else if (taxableIncome <= 2400000) {
    tax = 200000 + (taxableIncome - 2000000) * 0.25;
  } else {
    tax = 300000 + (taxableIncome - 2400000) * 0.3;
  }

  return Math.round(tax * 1.04);
}

function calculateOldRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 250000) return 0;

  let tax = 0;
  if (taxableIncome <= 500000) {
    tax = (taxableIncome - 250000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = 12500 + (taxableIncome - 500000) * 0.2;
  } else {
    tax = 112500 + (taxableIncome - 1000000) * 0.3;
  }

  if (taxableIncome <= 500000) {
    tax = Math.max(0, tax - 12500);
  }

  return Math.round(tax * 1.04);
}

export function calculateInHandSalary(annualCTC: number, taxRegime: TaxRegime): InHandResult {
  if (!Number.isFinite(annualCTC) || annualCTC <= 0) {
    return { monthlyInHand: 0, takeHomePercentage: 0, annualTax: 0 };
  }

  const standardDeduction = taxRegime === "new" ? STANDARD_DEDUCTION_NEW : STANDARD_DEDUCTION_OLD;
  const taxableIncome = Math.max(0, annualCTC - standardDeduction);
  const annualTax =
    taxRegime === "new" ? calculateNewRegimeTax(taxableIncome) : calculateOldRegimeTax(taxableIncome);
  const annualInHand = Math.max(0, annualCTC - annualTax);
  const monthlyInHand = Math.round(annualInHand / 12);
  const takeHomePercentage =
    annualCTC > 0 ? Number(((annualInHand / annualCTC) * 100).toFixed(1)) : 0;

  return { monthlyInHand, takeHomePercentage, annualTax };
}

export function getSalaryBreakdown(annualCTC: number, taxRegime: TaxRegime): SalaryBreakdown {
  if (!Number.isFinite(annualCTC) || annualCTC <= 0) {
    return {
      annualCTC: 0,
      standardDeduction: 0,
      taxableIncome: 0,
      annualTax: 0,
      annualInHand: 0,
      monthlyCTC: 0,
      monthlyTax: 0,
      monthlyInHand: 0,
      taxPercentage: 0,
      takeHomePercentage: 0,
    };
  }

  const standardDeduction = taxRegime === "new" ? STANDARD_DEDUCTION_NEW : STANDARD_DEDUCTION_OLD;
  const taxableIncome = Math.max(0, annualCTC - standardDeduction);
  const annualTax =
    taxRegime === "new" ? calculateNewRegimeTax(taxableIncome) : calculateOldRegimeTax(taxableIncome);
  const annualInHand = Math.max(0, annualCTC - annualTax);

  const monthlyCTC = Math.round(annualCTC / 12);
  const monthlyTax = Math.round(annualTax / 12);
  const monthlyInHand = Math.round(annualInHand / 12);

  const taxPercentage = annualCTC > 0 ? Number(((annualTax / annualCTC) * 100).toFixed(1)) : 0;
  const takeHomePercentage =
    annualCTC > 0 ? Number(((annualInHand / annualCTC) * 100).toFixed(1)) : 0;

  return {
    annualCTC,
    standardDeduction,
    taxableIncome,
    annualTax,
    annualInHand,
    monthlyCTC,
    monthlyTax,
    monthlyInHand,
    taxPercentage,
    takeHomePercentage,
  };
}
