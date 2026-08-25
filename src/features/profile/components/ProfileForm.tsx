import { useState, type FormEvent } from "react";
import type { CreateProfileInput, Profile } from "@domain/models";
import { Button, Input, Select } from "@shared/ui";
import { CITIES, INDUSTRIES, JOB_TITLES } from "@shared/constants/data";
import { formatIndianCurrencyInput, parseCurrencyInput } from "@shared/utils/currency";

interface ProfileFormProps {
  initial?: Profile | null;
  submitLabel: string;
  onSubmit: (input: CreateProfileInput) => void;
  isSubmitting?: boolean;
}

export function ProfileForm({ initial, submitLabel, onSubmit, isSubmitting }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [experienceYears, setExperienceYears] = useState(String(initial?.experienceYears ?? ""));
  // `||` (not `??`) is deliberate: a freshly-registered profile has these as
  // empty strings (not null/undefined) until profile-setup fills them in, and
  // an empty string should also fall back to the default option rather than
  // leaving the <select> bound to a value that matches nothing.
  const [industry, setIndustry] = useState(initial?.industry || INDUSTRIES[0]);
  const [currentRole, setCurrentRole] = useState(initial?.currentRole || JOB_TITLES[0]);
  const [location, setLocation] = useState(initial?.location || CITIES[0]);
  const [currentCtcInput, setCurrentCtcInput] = useState(initial?.currentCtc ? String(initial.currentCtc) : "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const years = Number(experienceYears);
    const currentCtc = currentCtcInput ? parseCurrencyInput(currentCtcInput) : 0;
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!Number.isFinite(years) || years < 0 || years > 60) {
      setError("Please enter a valid experience between 0 and 60 years.");
      return;
    }
    if (currentCtcInput && (!Number.isFinite(currentCtc) || currentCtc < 0)) {
      setError("Please enter a valid current CTC.");
      return;
    }

    setError(null);
    onSubmit({
      fullName: fullName.trim(),
      experienceYears: years,
      industry,
      currentRole,
      location,
      currentCtc,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
      <Input
        label="Experience (years)"
        type="number"
        min={0}
        max={60}
        step="any"
        value={experienceYears}
        onChange={(e) => setExperienceYears(e.target.value)}
        placeholder="e.g. 5.5"
      />
      <Input
        label="Current annual CTC (₹, optional)"
        inputMode="numeric"
        value={currentCtcInput}
        onChange={(e) => setCurrentCtcInput(formatIndianCurrencyInput(e.target.value))}
        placeholder="e.g. 18,00,000"
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
