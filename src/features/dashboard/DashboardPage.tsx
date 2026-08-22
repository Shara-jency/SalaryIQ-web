import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, EmptyState } from "@shared/ui";
import { formatCurrency } from "@shared/utils/currency";
import { useCurrentProfile } from "@features/profile/hooks/useProfile";
import { useLatestSalaryEntry } from "@features/analyzer/hooks/useSalaryEntries";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  { to: "/analyzer", label: "Analyze Salary", icon: "🧮" },
  { to: "/growth", label: "Salary Growth", icon: "📈" },
  { to: "/history", label: "Salary History", icon: "🕒" },
  { to: "/reports", label: "Reports", icon: "📊" },
];

export function DashboardPage() {
  const { profile } = useCurrentProfile();
  const { data: latest } = useLatestSalaryEntry(profile?.id);
  const [showSalary, setShowSalary] = useState(true);

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-text-secondary">{getGreeting()},</p>
        <p className="text-xl font-extrabold">{profile?.fullName ?? "there"} 👋</p>
      </div>

      <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand-from to-brand-to p-6 text-white">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-primary-light">Current CTC</p>
          <button onClick={() => setShowSalary((v) => !v)} aria-label="Toggle salary visibility" className="text-lg">
            {showSalary ? "🙈" : "👁️"}
          </button>
        </div>
        <p className="mb-4 text-2xl font-extrabold">
          {showSalary ? formatCurrency(latest?.annualCtc ?? 0) : "₹••••••"}
        </p>
        <p className="text-xs text-primary-light">Monthly in-hand (est.)</p>
        <p className="text-lg font-bold">{showSalary ? formatCurrency(latest?.monthlyInHand ?? 0) : "₹••••••"}</p>
      </div>

      <h2 className="mb-3 text-sm font-bold">Quick actions</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-5 text-center transition-colors hover:border-primary"
          >
            <span className="text-2xl">{action.icon}</span>
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
            <span aria-hidden>→</span>
          </Card>
        </Link>
      ) : (
        <EmptyState title="No salary analysis yet" message="Analyze your salary to see your results here." />
      )}
    </div>
  );
}
