import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BrandLogo, Button, Card, Footer, Input } from "@shared/ui";
import { requestPasswordReset } from "./hooks/usePasswordReset";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; devResetUrl?: string } | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setResult(await requestPasswordReset(email.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
          <h1 className="mb-1 text-xl font-bold">Reset your password</h1>
          <p className="mb-5 text-sm text-text-secondary">
            Enter your account email and we'll send you a reset link.
          </p>

          {result ? (
            <>
              <p className="mb-4 rounded-lg bg-primary-light px-3 py-2 text-sm text-primary">
                {result.message}
              </p>
              {result.devResetUrl ? (
                <p className="mb-4 break-all rounded-lg border border-dashed border-border p-3 text-xs text-text-secondary">
                  Dev mode (no email provider configured):{" "}
                  <Link to={result.devResetUrl.replace(window.location.origin, "")} className="text-primary underline">
                    {result.devResetUrl}
                  </Link>
                </p>
              ) : null}
              <Link to="/login" className="text-sm font-semibold text-primary hover:underline">
                Back to log in
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
              <Button type="submit" loading={submitting} className="w-full">
                Send reset link
              </Button>
              <p className="mt-4 text-center text-sm text-text-secondary">
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Back to log in
                </Link>
              </p>
            </form>
          )}
        </Card>
        <Footer className="mt-6" />
      </div>
    </div>
  );
}
