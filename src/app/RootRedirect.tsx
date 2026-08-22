import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

/**
 * Used for "/" and any unrecognized path. Deliberately bypasses RequireAuth's
 * redirect-to-/login behavior (which is correct for someone deep-linking a
 * protected route like /analyzer, since they were clearly trying to reach
 * something specific) — landing on the bare site root with no session should
 * show the marketing Welcome page, not a login form.
 */
export function RootRedirect() {
  const { status } = useAuth();

  if (status === "loading") return null;

  return <Navigate to={status === "authenticated" ? "/home" : "/welcome"} replace />;
}
