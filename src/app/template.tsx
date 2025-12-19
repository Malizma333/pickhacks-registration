"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "~/components/layout/DashboardLayout";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const excludeLayout =
    pathname === "/login" ||
    pathname.startsWith("/admin") ||
    pathname === "/verify-email";

  if (excludeLayout) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
