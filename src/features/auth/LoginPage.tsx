import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandLogo, Button, Card, Input } from "@shared/ui";
import { useAuth } from "@app/AuthProvider";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await login(email.trim(), password);
      const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
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
          <h1 className="mb-1 text-xl font-bold">Welcome back</h1>
          <p className="mb-5 text-sm text-text-secondary">Log in to continue.</p>

          {(location.state as { passwordReset?: boolean } | null)?.passwordReset ? (
            <p className="mb-4 rounded-lg bg-success-light px-3 py-2 text-sm text-success">
              Your password has been updated — log in with your new password.
            </p>
          ) : null}

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />

            <div className="mb-4 text-right">
              <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

            <Button type="submit" loading={submitting} className="w-full">
              Log in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
