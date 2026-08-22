import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

/**
 * Replaces the old RequireProfile (local-only, no-auth) guard now that
 * accounts are real. Renders nothing while the session is being restored
 * from the refresh cookie on first load, redirects to /login when there's
 * no valid session, and preserves the originally-requested path so login
 * can send the user back where they meant to go.
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
