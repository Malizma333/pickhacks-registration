"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "~/components/layout/DashboardLayout";

const excludeSidebarPaths = [
  "/login",
  "/verify-email",
  "/forgot-password",
  "/reset-password"
];

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const excludeLayout =
    pathname.startsWith("/admin") || excludeSidebarPaths.includes(pathname);

  if (excludeLayout) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
