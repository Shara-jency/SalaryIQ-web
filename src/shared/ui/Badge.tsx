type Tone = "success" | "danger" | "neutral";

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
}

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success-light text-success",
  danger: "bg-danger-light text-danger",
  neutral: "bg-primary-light text-primary",
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
