import type { TaxRegime } from "../models";

/**
 * FY 2025-26 India tax rules, ported from the RN app's salaryEngine.ts.
 * New regime: Section 87A rebate makes tax zero up to 12,00,000 taxable income.
 * Old regime: Section 87A rebate up to 12,500 if taxable income <= 5,00,000.
 */

const STANDARD_DEDUCTION_NEW = 75000;
const STANDARD_DEDUCTION_OLD = 50000;

// EPF (Employees' Provident Fund): the employee contributes 12% of basic
// pay, calculated on basic capped at the EPFO wage ceiling of ₹15,000/month
// (₹1,80,000/year). Some employers match this with an equal contribution
// that's part of CTC but never reaches the employee; others (esp. smaller
// companies) don't structure CTC with an employer PF component at all — the
// caller indicates which applies via `hasEmployerPf`. Since the actual CTC
// break-up isn't collected from the user, basic pay is approximated as 50%
// of CTC — a common assumption used by online in-hand salary calculators.
const ASSUMED_BASIC_PERCENTAGE_OF_CTC = 0.5;
const EPF_RATE = 0.12;
const EPF_WAGE_CEILING_ANNUAL = 15000 * 12;

export interface EpfDeductions {
  employeePF: number;
  employerPF: number;
}

export interface InHandResult {
  monthlyInHand: number;
  takeHomePercentage: number;
  annualTax: number;
}

export interface SalaryBreakdown {
  annualCTC: number;
  employerPF: number;
  grossSalary: number;
  standardDeduction: number;
  taxableIncome: number;
  annualTax: number;
  employeePF: number;
  annualInHand: number;
  monthlyCTC: number;
  monthlyTax: number;
  monthlyPF: number;
  monthlyInHand: number;
  taxPercentage: number;
  takeHomePercentage: number;
}

function calculateEpfDeductions(annualCTC: number, hasEmployerPf: boolean): EpfDeductions {
  const basic = annualCTC * ASSUMED_BASIC_PERCENTAGE_OF_CTC;
  const pfWage = Math.min(basic, EPF_WAGE_CEILING_ANNUAL);
  const contribution = Math.round(pfWage * EPF_RATE);
  return { employeePF: contribution, employerPF: hasEmployerPf ? contribution : 0 };
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

export function calculateInHandSalary(
  annualCTC: number,
  taxRegime: TaxRegime,
  hasEmployerPf: boolean = true,
): InHandResult {
  if (!Number.isFinite(annualCTC) || annualCTC <= 0) {
    return { monthlyInHand: 0, takeHomePercentage: 0, annualTax: 0 };
  }

  const { employeePF, employerPF } = calculateEpfDeductions(annualCTC, hasEmployerPf);
  const grossSalary = annualCTC - employerPF;

  const standardDeduction = taxRegime === "new" ? STANDARD_DEDUCTION_NEW : STANDARD_DEDUCTION_OLD;
  const taxableIncome = Math.max(0, grossSalary - standardDeduction);
  const annualTax =
    taxRegime === "new" ? calculateNewRegimeTax(taxableIncome) : calculateOldRegimeTax(taxableIncome);
  const annualInHand = Math.max(0, grossSalary - employeePF - annualTax);
  const monthlyInHand = Math.round(annualInHand / 12);
  const takeHomePercentage =
    annualCTC > 0 ? Number(((annualInHand / annualCTC) * 100).toFixed(1)) : 0;

  return { monthlyInHand, takeHomePercentage, annualTax };
}

export function getSalaryBreakdown(
  annualCTC: number,
  taxRegime: TaxRegime,
  hasEmployerPf: boolean = true,
): SalaryBreakdown {
  if (!Number.isFinite(annualCTC) || annualCTC <= 0) {
    return {
      annualCTC: 0,
      employerPF: 0,
      grossSalary: 0,
      standardDeduction: 0,
      taxableIncome: 0,
      annualTax: 0,
      employeePF: 0,
      annualInHand: 0,
      monthlyCTC: 0,
      monthlyTax: 0,
      monthlyPF: 0,
      monthlyInHand: 0,
      taxPercentage: 0,
      takeHomePercentage: 0,
    };
  }

  const { employeePF, employerPF } = calculateEpfDeductions(annualCTC, hasEmployerPf);
  const grossSalary = annualCTC - employerPF;

  const standardDeduction = taxRegime === "new" ? STANDARD_DEDUCTION_NEW : STANDARD_DEDUCTION_OLD;
  const taxableIncome = Math.max(0, grossSalary - standardDeduction);
  const annualTax =
    taxRegime === "new" ? calculateNewRegimeTax(taxableIncome) : calculateOldRegimeTax(taxableIncome);
  const annualInHand = Math.max(0, grossSalary - employeePF - annualTax);

  const monthlyCTC = Math.round(annualCTC / 12);
  const monthlyTax = Math.round(annualTax / 12);
  const monthlyPF = Math.round(employeePF / 12);
  const monthlyInHand = Math.round(annualInHand / 12);

  const taxPercentage = annualCTC > 0 ? Number(((annualTax / annualCTC) * 100).toFixed(1)) : 0;
  const takeHomePercentage =
    annualCTC > 0 ? Number(((annualInHand / annualCTC) * 100).toFixed(1)) : 0;

  return {
    annualCTC,
    employerPF,
    grossSalary,
    standardDeduction,
    taxableIncome,
    annualTax,
    employeePF,
    annualInHand,
    monthlyCTC,
    monthlyTax,
    monthlyPF,
    monthlyInHand,
    taxPercentage,
    takeHomePercentage,
  };
}
