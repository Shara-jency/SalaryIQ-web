import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BarChartIcon,
  CalculatorIcon,
  Card,
  ClockIcon,
  EmptyState,
  EyeIcon,
  EyeOffIcon,
  TrendingUpIcon,
} from "@shared/ui";
import { formatCurrency } from "@shared/utils/currency";
import { calculateInHandSalary } from "@domain/logic";
import { useCurrentProfile } from "@features/profile/hooks/useProfile";
import { useLatestSalaryEntry } from "@features/analyzer/hooks/useSalaryEntries";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  { to: "/analyzer", label: "Analyze Salary", icon: CalculatorIcon },
  { to: "/growth", label: "Salary Growth", icon: TrendingUpIcon },
  { to: "/history", label: "Salary History", icon: ClockIcon },
  { to: "/reports", label: "Reports", icon: BarChartIcon },
];

export function HomePage() {
  const { profile } = useCurrentProfile();
  const { data: latest } = useLatestSalaryEntry(profile?.id);
  const [showSalary, setShowSalary] = useState(true);

  const currentCtc = profile?.currentCtc ?? 0;
  // A rough estimate (new regime, employer PF assumed) purely for this
  // at-a-glance card — the Analyzer's breakdown uses your actual choices.
  const estimatedMonthlyInHand = useMemo(() => calculateInHandSalary(currentCtc, "new", true).monthlyInHand, [currentCtc]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-text-secondary">{getGreeting()},</p>
        <p className="text-xl font-extrabold">{profile?.fullName ?? "there"}</p>
      </div>

      <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand-from to-brand-to p-6 text-white">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-primary-light">Current CTC</p>
          <button onClick={() => setShowSalary((v) => !v)} aria-label="Toggle salary visibility">
            {showSalary ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
          </button>
        </div>
        {currentCtc > 0 ? (
          <>
            <p className="mb-4 text-2xl font-extrabold">{showSalary ? formatCurrency(currentCtc) : "₹••••••"}</p>
            <p className="text-xs text-primary-light">Monthly in-hand (est.)</p>
            <p className="text-lg font-bold">{showSalary ? formatCurrency(estimatedMonthlyInHand) : "₹••••••"}</p>
          </>
        ) : (
          <p className="text-sm text-white/80">
            <Link to="/profile" className="font-semibold underline">
              Set your current CTC
            </Link>{" "}
            on your profile to see it here.
          </p>
        )}
      </div>

      <h2 className="mb-3 text-sm font-bold">Quick actions</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-5 text-center transition-colors hover:border-primary"
          >
            <action.icon className="h-6 w-6 text-primary" aria-hidden />
            <span className="text-xs font-semibold">{action.label}</span>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-bold">Latest analysis</h2>
      {latest ? (
        <Link to="/analyzer">
          <Card className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{latest.jobTitle}</p>
              <p className="text-xs text-text-secondary">
                {latest.experienceYears} yrs • {latest.city}
              </p>
              <p className="text-xs text-text-light">{new Date(latest.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-text-light" aria-hidden />
          </Card>
        </Link>
      ) : (
        <EmptyState title="No salary analysis yet" message="Analyze your salary to see your results here." />
      )}
    </div>
  );
}
