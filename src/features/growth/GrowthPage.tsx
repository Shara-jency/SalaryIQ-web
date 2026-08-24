import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Select } from "@shared/ui";
import { formatIndianCurrencyInput, parseCurrencyInput } from "@shared/utils/currency";
import { projectGrowth } from "@domain/logic";
import { useCurrentProfile } from "@features/profile/hooks/useProfile";
import { useLatestSalaryEntry } from "@features/analyzer/hooks/useSalaryEntries";
import { useLatestGrowthProjection, useSaveGrowthProjection } from "./hooks/useGrowthProjection";
import { GrowthChart } from "./components/GrowthChart";

const YEARS_OPTIONS = Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} year${i === 0 ? "" : "s"}` }));

function resizeHikes(hikes: number[], length: number): number[] {
  if (hikes.length === length) return hikes;
  if (hikes.length > length) return hikes.slice(0, length);
  return [...hikes, ...Array.from({ length: length - hikes.length }, () => 10)];
}

export function GrowthPage() {
  const { profile } = useCurrentProfile();
  const { data: latestEntry } = useLatestSalaryEntry(profile?.id);
  const { data: savedProjection } = useLatestGrowthProjection(profile?.id);
  const saveProjection = useSaveGrowthProjection(profile?.id);

  const [yearsToStay, setYearsToStay] = useState(3);
  const [hikes, setHikes] = useState<number[]>([10, 10, 10]);
  const [hydrated, setHydrated] = useState(false);
  const [ctcInput, setCtcInput] = useState("");
  const [ctcHydrated, setCtcHydrated] = useState(false);

  useEffect(() => {
    if (savedProjection && !hydrated) {
      setYearsToStay(savedProjection.yearsToStay);
      setHikes(savedProjection.hikePercentages);
      setHydrated(true);
    }
  }, [savedProjection, hydrated]);

  // Prefills from the latest saved analysis as a convenience, but the user
  // can freely overwrite it — growth projections shouldn't be silently
  // pinned to whatever CTC was last analyzed.
  useEffect(() => {
    if (latestEntry && !ctcHydrated) {
      setCtcInput(String(latestEntry.annualCtc));
      setCtcHydrated(true);
    }
  }, [latestEntry, ctcHydrated]);

  const currentCtc = parseCurrencyInput(ctcInput);
  const isUsingLatestEntry = Boolean(latestEntry) && currentCtc === latestEntry?.annualCtc;
  const years = useMemo(() => projectGrowth(currentCtc, hikes), [currentCtc, hikes]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Salary Growth</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Input
            label="Current annual CTC (₹)"
            inputMode="numeric"
            value={ctcInput}
            onChange={(e) => setCtcInput(formatIndianCurrencyInput(e.target.value))}
            placeholder="e.g. 18,00,000"
          />

          <Select
            label="Years to stay"
            value={String(yearsToStay)}
            onChange={(e) => {
              const next = Number(e.target.value);
              setYearsToStay(next);
              setHikes((prev) => resizeHikes(prev, next));
            }}
            options={YEARS_OPTIONS}
          />

          <p className="mb-2 text-sm font-semibold text-text">Hike % per year</p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            {hikes.map((hike, index) => (
              <Input
                key={index}
                label={`Year ${index + 1}`}
                type="number"
                value={String(hike)}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setHikes((prev) => prev.map((h, i) => (i === index ? (Number.isFinite(value) ? value : 0) : h)));
                }}
              />
            ))}
          </div>

          <p className="mb-4 text-xs text-text-light">
            Projections are for planning purposes only; actual growth depends on performance and employer.
          </p>

          <Button
            className="w-full"
            disabled={currentCtc <= 0}
            loading={saveProjection.isPending}
            onClick={() =>
              saveProjection.mutate({
                existingId: savedProjection?.id,
                yearsToStay,
                hikePercentages: hikes,
                salaryEntryId: isUsingLatestEntry ? latestEntry?.id : undefined,
              })
            }
          >
            Save projection
          </Button>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-bold">Projected growth</h2>
          {currentCtc > 0 ? (
            <GrowthChart currentCtc={currentCtc} years={years} />
          ) : (
            <p className="text-sm text-text-secondary">Enter your current annual CTC to see a projection.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
