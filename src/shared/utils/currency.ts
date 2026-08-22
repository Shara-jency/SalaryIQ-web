const DIGITS_ONLY_REGEX = /\D/g;

export function formatIndianCurrencyInput(value: string): string {
  const digits = value.replace(DIGITS_ONLY_REGEX, "");
  if (!digits) return "";
  if (digits.length <= 3) return digits;

  const lastThree = digits.slice(-3);
  const leading = digits.slice(0, -3);
  const formattedLeading = leading.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return `${formattedLeading},${lastThree}`;
}

export function parseCurrencyInput(value: string): number {
  return Number(value.replace(DIGITS_ONLY_REGEX, ""));
}

export function formatCurrency(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}
