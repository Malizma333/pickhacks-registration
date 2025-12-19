interface FormInputProps {
  type: "email" | "password" | "text" | "tel" | "url" | "number" | "date" | "datetime-local";
  name: string;
  placeholder?: string;
  bgColor?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function FormInput({
  type,
  name,
  placeholder = "",
  bgColor = "bg-gray-50",
  value,
  onChange,
  required = false,
  min,
  max,
  disabled = false,
}: FormInputProps) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      max={max}
      disabled={disabled}
      className={`w-full rounded-lg border border-gray-200 ${bgColor} px-4 py-3.5 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-[#44ab48] focus:outline-none focus:ring-4 focus:ring-[#44ab48]/10 focus:bg-white hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60`}
    />
  );
}
