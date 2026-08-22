export interface MarketComparison {
  status: string;
  difference: number;
  percentage: number;
  signedPercentage: number;
  isUnderpaid: boolean;
}

export function compareWithMarket(ctc: number, marketAvg: number): MarketComparison {
  if (!Number.isFinite(ctc) || !Number.isFinite(marketAvg) || marketAvg <= 0) {
    return {
      status: "Unable to Compare",
      difference: 0,
      percentage: 0,
      signedPercentage: 0,
      isUnderpaid: false,
    };
  }

  const difference = ctc - marketAvg;
  const signedPercentage = Math.round((difference / marketAvg) * 100);
  const isUnderpaid = difference < 0;

  return {
    status: isUnderpaid ? "Underpaid" : "Well Paid",
    difference: Math.abs(difference),
    percentage: Math.abs(signedPercentage),
    signedPercentage,
    isUnderpaid,
  };
}
