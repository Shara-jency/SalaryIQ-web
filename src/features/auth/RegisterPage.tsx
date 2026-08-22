import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo, Button, Card, Input, Select } from "@shared/ui";
import { CITIES, INDUSTRIES, JOB_TITLES } from "@shared/constants/data";
import { useAuth } from "@app/AuthProvider";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [currentRole, setCurrentRole] = useState(JOB_TITLES[0]);
  const [location, setLocation] = useState(CITIES[0]);

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
    const years = Number(experienceYears);
    if (!Number.isFinite(years) || years < 0 || years > 60) {
      setError("Please enter a valid experience between 0 and 60 years.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        experienceYears: years,
        industry,
        currentRole,
        location,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="lg" />
        </div>
        <Card>
          <h1 className="mb-1 text-xl font-bold">Create your account</h1>
          <p className="mb-5 text-sm text-text-secondary">
            Takes a minute — your data is tied to this account from now on.
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
            <Input
              label="Experience (years)"
              type="number"
              min={0}
              max={60}
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              placeholder="e.g. 5"
            />
            <Select label="Current role" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} options={JOB_TITLES.map((t) => ({ value: t, label: t }))} />
            <Select label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} options={INDUSTRIES.map((i) => ({ value: i, label: i }))} />
            <Select label="Location" value={location} onChange={(e) => setLocation(e.target.value)} options={CITIES.map((c) => ({ value: c, label: c }))} />

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
      </div>
    </div>
  );
}
