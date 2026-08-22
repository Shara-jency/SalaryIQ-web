import { Navigate, Outlet } from "react-router-dom";
import { useCurrentProfile } from "@features/profile/hooks/useProfile";

/**
 * Registration only collects email/password/name — role, industry,
 * experience, and location are filled in afterward on /profile-setup. This
 * gates every other authenticated route on that step being done, so a fresh
 * signup can't reach Home with an empty profile.
 */
export function RequireCompleteProfile() {
  const { profile, isLoading } = useCurrentProfile();

  if (isLoading) return null;

  const isComplete = Boolean(profile?.currentRole && profile?.industry && profile?.location);
  if (!isComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <Outlet />;
}
