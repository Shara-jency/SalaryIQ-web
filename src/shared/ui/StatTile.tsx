interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
}

export function StatTile({ label, value, sub }: StatTileProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-text">{value}</p>
      {sub ? <p className="mt-1 text-xs text-text-light">{sub}</p> : null}
    </div>
  );
}
