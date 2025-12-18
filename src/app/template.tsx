"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "~/components/layout/DashboardLayout";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show sidebar on login page
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
