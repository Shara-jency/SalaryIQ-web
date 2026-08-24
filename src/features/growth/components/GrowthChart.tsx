import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProjectedYear } from "@domain/models";
import { formatCurrency } from "@shared/utils/currency";

interface GrowthChartProps {
  currentCtc: number;
  years: ProjectedYear[];
}

export function GrowthChart({ currentCtc, years }: GrowthChartProps) {
  const data = [
    { label: "Now", ctc: currentCtc },
    ...years.map((y) => ({ label: `Year ${y.year}`, ctc: y.projectedCtc })),
  ];

  return (
    <div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `₹${Math.round(v / 100000)}L`} tick={{ fontSize: 12 }} width={56} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line type="monotone" dataKey="ctc" stroke="var(--color-primary)" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((point, index) => (
          <div key={point.label} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0">
            <span className="text-text-secondary">{point.label}</span>
            <span className="font-semibold text-text">
              {formatCurrency(point.ctc)}
              {index > 0 ? <span className="ml-2 text-xs font-normal text-text-light">+{years[index - 1].hikePercentage}%</span> : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
