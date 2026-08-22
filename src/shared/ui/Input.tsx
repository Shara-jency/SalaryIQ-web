import { useId, useState, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const EYE_OPEN = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4.5 w-4.5">
    <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EYE_OFF = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4.5 w-4.5">
    <path
      d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.6 6.7C3.8 8.4 1.5 12 1.5 12S5 19 12 19c1.9 0 3.5-.4 4.9-1.1M17.6 15.6C20.1 13.9 22.5 12 22.5 12S19 5 12 5c-.7 0-1.4.06-2 .17"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Input({ label, error, id, className = "", type, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword && visible ? "text" : type;

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-text">
        {label}
      </label>
      <div
        className={`flex h-12 items-center rounded-lg border bg-card pr-2 ${
          error ? "border-danger" : "border-border"
        } focus-within:border-primary`}
      >
        <input
          id={inputId}
          type={resolvedType}
          className={`h-full min-w-0 flex-1 rounded-lg bg-transparent px-3.5 text-sm text-text outline-none ${className}`}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-light hover:text-text-secondary"
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? EYE_OFF : EYE_OPEN}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
