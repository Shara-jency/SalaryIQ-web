import { Link } from "react-router-dom";
import { BarChartIcon, BrandLogo, Button, CalculatorIcon, Card, ClockIcon, Footer, TrendingUpIcon } from "@shared/ui";

const FEATURES = [
  {
    icon: CalculatorIcon,
    title: "Salary Analyzer",
    description: "Compare your CTC against India 2025–26 market benchmarks and see an estimated in-hand salary.",
  },
  {
    icon: TrendingUpIcon,
    title: "Growth Projector",
    description: "Simulate future salary growth over 1–10 years using your own expected hike percentages.",
  },
  {
    icon: ClockIcon,
    title: "Salary History",
    description: "Log past salaries year by year, guided by a template based on your experience, and see your growth trend.",
  },
  {
    icon: BarChartIcon,
    title: "Reports",
    description: "See aggregate stats across everything you've saved — highest CTC, average in-hand, roles tracked.",
  },
];

export function WelcomePage() {
  return (
    <div className="min-h-screen bg-app-background text-text">
      <header className="flex items-center justify-between px-6 py-5 lg:px-12">
        <BrandLogo size="md" />
        <Link to="/about" className="text-sm font-semibold text-text-secondary hover:text-primary">
          About &amp; how to use
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10 lg:py-16">
        <div className="mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-from to-brand-to px-6 py-12 text-center text-white lg:py-16">
          <img src="/icon-512.png" alt="" className="mx-auto mb-5 h-16 w-16 rounded-2xl lg:h-20 lg:w-20" />
          <h1 className="mb-3 text-3xl font-extrabold lg:text-4xl">Know your worth.</h1>
          <p className="mx-auto max-w-xl text-white/80">
            SalaryIQ helps you check your salary against the market, estimate your take-home pay, track your
            history, and project future growth — all in a few minutes.
          </p>
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="flex gap-4">
              <feature.icon className="h-6 w-6 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">{feature.title}</p>
                <p className="text-sm text-text-secondary">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mb-8 bg-primary-light">
          <p className="text-sm text-primary">
            Your data is tied to your account and stored securely on the server — see{" "}
            <Link to="/about" className="font-semibold underline">
              About &amp; how to use
            </Link>{" "}
            for details on what's stored and what to double-check before trusting the numbers.
          </p>
        </Card>

        <div className="flex flex-col items-center gap-3 text-center">
          <Link to="/register">
            <Button className="px-10">Get started</Button>
          </Link>
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <Footer className="mt-12" />
      </main>
    </div>
  );
}
