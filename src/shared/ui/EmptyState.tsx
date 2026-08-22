interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <p className="font-semibold text-text">{title}</p>
      <p className="mt-1 text-sm text-text-secondary">{message}</p>
    </div>
  );
}
