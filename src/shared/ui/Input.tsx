import { useId, useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "./Icon";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

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
            {visible ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
