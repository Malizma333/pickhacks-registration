interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function Select({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  className = "",
}: SelectProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={`w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900 transition-all duration-200 focus:border-[#44ab48] focus:outline-none focus:ring-4 focus:ring-[#44ab48]/10 focus:bg-white hover:border-gray-300 ${className}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
