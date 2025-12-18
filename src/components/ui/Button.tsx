import { type ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  type = "button",
  variant = "primary",
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const baseStyles = "rounded-lg py-3 text-lg font-semibold transition";
  const variantStyles =
    variant === "primary"
      ? "bg-[#6db872] text-white hover:bg-[#5da662]"
      : "border-2 border-[#44ab48] text-[#44ab48] hover:bg-[#44ab48] hover:text-white";
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles} ${widthStyles} ${className}`}
    >
      {children}
    </button>
  );
}
