import { useId, type SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
}

export function Select({ label, options, id, className = "", ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="mb-4">
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-semibold text-text">
        {label}
      </label>
      <select
        id={selectId}
        className={`h-12 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-text outline-none focus:border-primary ${className}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
