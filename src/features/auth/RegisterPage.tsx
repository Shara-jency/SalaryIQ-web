import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo, Button, Card, Footer, Input } from "@shared/ui";
import { useAuth } from "@app/AuthProvider";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.");
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
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await register({ email: email.trim(), password, fullName: fullName.trim() });
      navigate("/profile-setup", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="lg" />
        </div>
        <Card>
          <h1 className="mb-1 text-xl font-bold">Create your account</h1>
          <p className="mb-5 text-sm text-text-secondary">
            Just the basics for now — you'll fill in your role and experience next.
          </p>

          <form onSubmit={handleSubmit}>
            <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
            />

            {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

            <Button type="submit" loading={submitting} className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </Card>
        <Footer className="mt-6" />
      </div>
    </div>
  );
}
