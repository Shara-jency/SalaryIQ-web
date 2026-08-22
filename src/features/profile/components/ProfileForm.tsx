import { useState, type FormEvent } from "react";
import type { CreateProfileInput, Profile } from "@domain/models";
import { Button, Input, Select } from "@shared/ui";
import { CITIES, INDUSTRIES, JOB_TITLES } from "@shared/constants/data";

interface ProfileFormProps {
  initial?: Profile | null;
  submitLabel: string;
  onSubmit: (input: CreateProfileInput) => void;
  isSubmitting?: boolean;
}

export function ProfileForm({ initial, submitLabel, onSubmit, isSubmitting }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [experienceYears, setExperienceYears] = useState(String(initial?.experienceYears ?? ""));
  const [industry, setIndustry] = useState(initial?.industry ?? INDUSTRIES[0]);
  const [currentRole, setCurrentRole] = useState(initial?.currentRole ?? JOB_TITLES[0]);
  const [location, setLocation] = useState(initial?.location ?? CITIES[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const years = Number(experienceYears);
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!Number.isFinite(years) || years < 0 || years > 60) {
      setError("Please enter a valid experience between 0 and 60 years.");
      return;
    }

    setError(null);
    onSubmit({
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      experienceYears: years,
      industry,
      currentRole,
      location,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
      <Input label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
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

      <Button type="submit" loading={isSubmitting} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
