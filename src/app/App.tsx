import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@shared/layout/AppShell";
import { RequireAuth } from "./RequireAuth";
import { RequireCompleteProfile } from "./RequireCompleteProfile";
import { IdleSessionMonitor } from "./IdleSessionMonitor";
import { WelcomePage } from "@features/welcome/WelcomePage";
import { AboutPage } from "@features/about/AboutPage";
import { LoginPage } from "@features/auth/LoginPage";
import { RegisterPage } from "@features/auth/RegisterPage";
import { ForgotPasswordPage } from "@features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@features/auth/ResetPasswordPage";
import { HomePage } from "@features/home/HomePage";
import { AnalyzerPage } from "@features/analyzer/AnalyzerPage";
import { GrowthPage } from "@features/growth/GrowthPage";
import { HistoryPage } from "@features/history/HistoryPage";
import { ReportsPage } from "@features/reports/ReportsPage";
import { ProfilePage } from "@features/profile/ProfilePage";
import { ProfileSetupPage } from "@features/profile/ProfileSetupPage";

export function App() {
  return (
    <>
      <IdleSessionMonitor />
      <Routes>
        {/* Standalone pages — no sidebar/nav chrome, reachable without a session */}
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />

        {/* Standalone too, but requires a session — the mandatory step between
            registering and the rest of the app, so no sidebar/nav yet. */}
        <Route element={<RequireAuth />}>
          <Route path="profile-setup" element={<ProfileSetupPage />} />
        </Route>

        <Route element={<AppShell />}>
          {/* Reachable with or without a session, e.g. from the Welcome page */}
          <Route path="about" element={<AboutPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<RequireCompleteProfile />}>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route path="analyzer" element={<AnalyzerPage />} />
              <Route path="growth" element={<GrowthPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}
