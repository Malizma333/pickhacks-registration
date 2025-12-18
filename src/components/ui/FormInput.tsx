interface FormInputProps {
  type: "email" | "password" | "text";
  name: string;
  placeholder: string;
  bgColor?: string;
}

export function FormInput({
  type,
  name,
  placeholder,
  bgColor = "bg-white",
}: FormInputProps) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-gray-300 ${bgColor} px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-[#44ab48] focus:outline-none focus:ring-2 focus:ring-[#44ab48]`}
    />
  );
}
