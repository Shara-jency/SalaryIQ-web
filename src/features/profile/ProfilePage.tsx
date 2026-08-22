import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card } from "@shared/ui";
import { useAuth } from "@app/AuthProvider";
import { useClearProfile, useCurrentProfile, useUpdateProfile } from "./hooks/useProfile";
import { ProfileForm } from "./components/ProfileForm";

export function ProfilePage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { profile, isLoading } = useCurrentProfile();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useClearProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading || !profile) return null;

  const handleLogout = async () => {
    await auth.logout();
    navigate("/welcome", { replace: true });
  };

  const handleDeleteAccount = () => {
    if (
      !confirm(
        "This permanently deletes your account and everything tied to it (saved analyses, history, growth projections). This cannot be undone. Continue?",
      )
    ) {
      return;
    }
    deleteAccount.mutate(profile.id, {
      onSuccess: () => {
        auth.sessionExpired();
        navigate("/welcome", { replace: true });
      },
    });
  };

  if (editing) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold">Edit profile</h1>
        <Card>
          <ProfileForm
            initial={profile}
            submitLabel="Save changes"
            isSubmitting={updateProfile.isPending}
            onSubmit={(input) => {
              updateProfile.mutate(
                { id: profile.id, patch: input },
                { onSuccess: () => setEditing(false) },
              );
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <Card className="space-y-3">
        <div>
          <p className="text-xs text-text-secondary">Full name</p>
          <p className="font-semibold">{profile.fullName}</p>
        </div>
        {profile.email ? (
          <div>
            <p className="text-xs text-text-secondary">Email</p>
            <p className="font-semibold">{profile.email}</p>
          </div>
        ) : null}
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-text-secondary">Role</p>
            <p className="font-semibold">{profile.currentRole}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Experience</p>
            <p className="font-semibold">{profile.experienceYears} yrs</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-text-secondary">Industry</p>
            <Badge>{profile.industry}</Badge>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Location</p>
            <Badge>{profile.location}</Badge>
          </div>
        </div>
      </Card>

      <div className="mt-4 flex gap-3">
        <Button variant="secondary" onClick={() => setEditing(true)} className="flex-1">
          Edit profile
        </Button>
        <Button variant="secondary" onClick={handleLogout} className="flex-1">
          Log out
        </Button>
      </div>

      <Card className="mt-6 border-danger/30">
        <p className="mb-3 text-sm font-semibold text-danger">Danger zone</p>
        <p className="mb-3 text-sm text-text-secondary">
          Permanently delete your account and everything tied to it. This cannot be undone.
        </p>
        <Button variant="danger" loading={deleteAccount.isPending} onClick={handleDeleteAccount} className="w-full">
          Delete account
        </Button>
      </Card>
    </div>
  );
}
