import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BrandLogo, Button, Card, Footer, Input } from "@shared/ui";
import { resetPassword } from "./hooks/usePasswordReset";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) {
      setError("This reset link is missing its token — please request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await resetPassword(token, password);
      navigate("/login", { state: { passwordReset: true }, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="lg" />
        </div>
        <Card>
          <h1 className="mb-1 text-xl font-bold">Choose a new password</h1>
          <p className="mb-5 text-sm text-text-secondary">This link expires an hour after it was sent.</p>

          <form onSubmit={handleSubmit}>
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
            />

            {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

            <Button type="submit" loading={submitting} className="w-full">
              Update password
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-secondary">
            <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
              Request a new link
            </Link>
          </p>
        </Card>
        <Footer className="mt-6" />
      </div>
    </div>
  );
}
