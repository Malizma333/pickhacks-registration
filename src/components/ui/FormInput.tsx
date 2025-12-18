interface FormInputProps {
  type: "email" | "password" | "text" | "tel" | "url" | "number";
  name: string;
  placeholder: string;
  bgColor?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: number;
  max?: number;
}

export function FormInput({
  type,
  name,
  placeholder,
  bgColor = "bg-gray-50",
  value,
  onChange,
  required = false,
  min,
  max,
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
      className={`w-full rounded-lg border border-gray-200 ${bgColor} px-4 py-3.5 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-[#44ab48] focus:outline-none focus:ring-4 focus:ring-[#44ab48]/10 focus:bg-white hover:border-gray-300`}
    />
  );
}
