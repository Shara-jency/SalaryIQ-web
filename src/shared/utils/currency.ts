const NON_NUMERIC_REGEX = /[^0-9.]/g;

export function formatIndianCurrencyInput(value: string): string {
  const cleaned = value.replace(NON_NUMERIC_REGEX, "");
  if (!cleaned) return "";

  const dotIndex = cleaned.indexOf(".");
  const hasDot = dotIndex !== -1;
  const integerDigits = hasDot ? cleaned.slice(0, dotIndex) : cleaned;
  const decimalDigits = hasDot ? cleaned.slice(dotIndex + 1).replace(/\./g, "").slice(0, 2) : "";

  let formattedInteger = integerDigits;
  if (integerDigits.length > 3) {
    const lastThree = integerDigits.slice(-3);
    const leading = integerDigits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formattedInteger = `${leading},${lastThree}`;
  }

  if (!hasDot) return formattedInteger;
  return `${formattedInteger || "0"}.${decimalDigits}`;
}

export function parseCurrencyInput(value: string): number {
  return Number(value.replace(NON_NUMERIC_REGEX, ""));
}

export function formatCurrency(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}
