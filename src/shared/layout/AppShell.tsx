import type { ComponentType } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChartIcon,
  BrandLogo,
  CalculatorIcon,
  ClockIcon,
  Footer,
  HomeIcon,
  InfoIcon,
  LogOutIcon,
  TrendingUpIcon,
  UserIcon,
  type IconProps,
} from "@shared/ui";
import { useAuth } from "@app/AuthProvider";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<IconProps>;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/home", label: "Home", icon: HomeIcon },
  { to: "/analyzer", label: "Analyze", icon: CalculatorIcon },
  { to: "/growth", label: "Growth", icon: TrendingUpIcon },
  { to: "/history", label: "History", icon: ClockIcon },
  { to: "/reports", label: "Reports", icon: BarChartIcon },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

function navLinkClasses(isActive: boolean): string {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? "bg-primary-light text-primary" : "text-text-secondary hover:bg-app-background"
  }`;
}

export function AppShell() {
  const { status, logout } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = status === "authenticated";

  const handleLogout = async () => {
    await logout();
    navigate("/welcome", { replace: true });
  };

  return (
    <div className="min-h-screen bg-app-background text-text lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-5 lg:flex lg:flex-col">
        <div className="mb-8 px-2">
          <BrandLogo size="md" />
          <p className="mt-1 text-xs text-text-light">Know Your Worth</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => navLinkClasses(isActive)}>
              <item.icon className="h-5 w-5 shrink-0" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/about" className={({ isActive }) => navLinkClasses(isActive)}>
          <InfoIcon className="h-5 w-5 shrink-0" aria-hidden />
          About &amp; how to use
        </NavLink>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-light"
          >
            <LogOutIcon className="h-5 w-5 shrink-0" aria-hidden />
            Log out
          </button>
        ) : null}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-4">
            <NavLink to="/about" className="text-text-secondary" aria-label="About and how to use">
              <InfoIcon className="h-5 w-5" />
            </NavLink>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="text-danger" aria-label="Log out">
                <LogOutIcon className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 lg:px-10 lg:py-10 lg:pb-10">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
            <Footer className="mt-10" />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 flex justify-between border-t border-border bg-card px-2 py-2 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-medium ${
                  isActive ? "text-primary" : "text-text-light"
                }`
              }
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
