import { AlertTriangleIcon, Card } from "@shared/ui";

const HOW_TO_STEPS = [
  {
    title: "Create your account",
    detail: "Sign up with your name, email, and password — quick, just the basics.",
  },
  {
    title: "Complete your profile",
    detail: "Add your current role, industry, experience, and location so SalaryIQ can compare you against the right market benchmarks.",
  },
  {
    title: "Analyze your salary",
    detail:
      "Enter your job title, experience, city, industry, company tier, and CTC. Choose \"For myself\" to save the result, or \"For someone else\" for a one-time check that isn't saved.",
  },
  {
    title: "Review the result",
    detail:
      "See your estimated monthly in-hand pay, how your CTC compares to the market average for a matched role/city, and the full tax breakdown.",
  },
  {
    title: "Track history",
    detail: "Manually log salaries from previous years to build a timeline of your earnings.",
  },
  {
    title: "Project growth",
    detail: "Set how many years you plan to stay and an expected hike % per year to see a compounding projection chart.",
  },
  {
    title: "Check your reports",
    detail: "See aggregate stats — average CTC, highest CTC, average in-hand, and how many distinct roles you've tracked — across everything you've saved.",
  },
];

const WHAT_TO_CHECK = [
  "Tax figures are estimates based on FY 2025–26 India tax slabs and standard deductions. Your actual in-hand pay depends on your employer's specific salary structure, PF contributions, and bonuses.",
  "Market benchmarks are matched by role title first (exact, then partial, then keyword inference, then experience-based fallback), so a very unusual job title may be compared against an approximated role rather than an exact match — the result panel shows which title was actually matched.",
  "Company tier adjustment (Tier 1/2/3) scales the benchmark range as a rough approximation, not a precise industry figure.",
  "Growth projections are for planning purposes only — actual salary growth depends on performance, employer, and market conditions, not just a fixed hike percentage.",
  "\"For someone else\" analyses are never saved, by design, so they won't show up in History, Growth, or Reports.",
];

function StepList() {
  return (
    <ol className="space-y-4">
      {HOW_TO_STEPS.map((step, index) => (
        <li key={step.title} className="flex gap-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
            {index + 1}
          </span>
          <div>
            <p className="font-semibold">{step.title}</p>
            <p className="text-sm text-text-secondary">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">About &amp; how to use</h1>
      <p className="mb-8 text-sm text-text-secondary">
        A quick guide to what SalaryIQ does, how to use it, and what to check before trusting the numbers.
      </p>

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-bold">How to use SalaryIQ</h2>
        <StepList />
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-bold">What to check before trusting the numbers</h2>
        <ul className="space-y-3">
          {WHAT_TO_CHECK.map((point) => (
            <li key={point} className="flex gap-3 text-sm text-text-secondary">
              <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-bold">Your data &amp; privacy</h2>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>Your profile, saved analyses, history, and growth projections are stored on the server against your account — log in from any device to see the same data.</li>
          <li>Passwords are hashed before storage and are never stored or logged in plain text.</li>
          <li>Logging out ends your session on this device only. Using "Delete account" on the Profile page permanently deletes your account and everything tied to it — this cannot be undone.</li>
        </ul>
      </Card>
    </div>
  );
}
