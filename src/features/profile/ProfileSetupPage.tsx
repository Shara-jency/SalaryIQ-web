import { useNavigate } from "react-router-dom";
import { BrandLogo, Card, Footer } from "@shared/ui";
import { useCurrentProfile, useUpdateProfile } from "./hooks/useProfile";
import { ProfileForm } from "./components/ProfileForm";

/**
 * Mandatory step between registering and the rest of the app — registration
 * only collects email/password/name, so RequireCompleteProfile routes here
 * until role, industry, experience, and location are filled in.
 */
export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { profile, isLoading } = useCurrentProfile();
  const updateProfile = useUpdateProfile();

  if (isLoading || !profile) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="lg" />
        </div>
        <Card>
          <h1 className="mb-1 text-xl font-bold">Complete your profile</h1>
          <p className="mb-5 text-sm text-text-secondary">
            This helps SalaryIQ compare your salary against the right market benchmarks.
          </p>

          <ProfileForm
            initial={profile}
            submitLabel="Continue"
            isSubmitting={updateProfile.isPending}
            onSubmit={(input) => {
              updateProfile.mutate(
                { id: profile.id, patch: input },
                { onSuccess: () => navigate("/dashboard", { replace: true }) },
              );
            }}
          />
        </Card>
        <Footer className="mt-6" />
      </div>
    </div>
  );
}
