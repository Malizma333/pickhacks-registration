import { type ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Button({
  children,
  type = "button",
  variant = "primary",
  fullWidth = false,
  disabled = false,
  className = "",
  onClick,
}: ButtonProps) {
  const baseStyles = "rounded-lg px-6 py-3 text-lg font-semibold transition-all duration-200";
  const variantStyles =
    variant === "primary"
      ? "bg-[#44ab48] text-white hover:bg-[#3a9c3e] hover:shadow-lg active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-none"
      : "border-2 border-[#44ab48] text-[#44ab48] hover:bg-[#44ab48] hover:text-white active:scale-95 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed";
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${widthStyles} ${className}`}
    >
      {children}
    </button>
  );
}
