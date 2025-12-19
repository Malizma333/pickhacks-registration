import { type ReactNode } from "react";

interface CheckboxProps {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({
  name,
  checked,
  onChange,
  label,
  required = false,
  className = "",
  disabled = false,
}: CheckboxProps) {
  return (
    <label
      className={`flex items-start gap-3.5 ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          disabled={disabled}
          className="peer sr-only"
        />
        <div className="h-5 w-5 rounded border-2 border-gray-300 bg-white transition-all peer-checked:border-[#44ab48] peer-checked:bg-[#44ab48] peer-focus:ring-4 peer-focus:ring-[#44ab48]/20 peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
        <svg
          className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span
        className={`text-base leading-relaxed text-gray-700 ${disabled ? "opacity-60" : ""}`}
      >
        {label}
      </span>
    </label>
  );
}
