import { type ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  type = "button",
  variant = "primary",
  fullWidth = false,
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseStyles = "rounded-lg py-3 text-lg font-semibold transition";
  const variantStyles =
    variant === "primary"
      ? "bg-[#6db872] text-white hover:bg-[#5da662] disabled:bg-gray-400 disabled:cursor-not-allowed"
      : "border-2 border-[#44ab48] text-[#44ab48] hover:bg-[#44ab48] hover:text-white disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed";
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${widthStyles} ${className}`}
    >
      {children}
    </button>
  );
}
