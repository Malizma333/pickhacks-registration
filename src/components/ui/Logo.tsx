import Image from "next/image";

interface LogoProps {
  variant?: "text" | "icon";
  width?: number;
  className?: string;
}

export function Logo({ variant = "text", width = 256, className = "" }: LogoProps) {
  const logoSrc = variant === "text" ? "/logo-text.svg" : "/logo.svg";
  const alt = variant === "text" ? "PickHacks Logo" : "PickHacks Logo Icon";
  const height = Math.round(width * 0.3125); // Maintain aspect ratio

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={`h-auto w-full ${className}`}
      priority
    />
  );
}
