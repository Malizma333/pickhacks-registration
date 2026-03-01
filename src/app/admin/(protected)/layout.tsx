"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkIsAdmin } from "~/server/actions/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      const result = await checkIsAdmin();
      if (!result.isAdmin) {
        router.replace("/admin/login");
      } else {
        setIsReady(true);
      }
    }
    void verifyAdmin();
  }, [router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#44ab48] border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                PickHacks Admin
              </h1>
              <p className="hidden sm:block text-sm text-gray-500">Event Management Dashboard</p>
            </div>
            <nav className="flex flex-wrap gap-2 sm:gap-3 md:gap-6">
              <a
                href="/admin"
                className="text-sm font-medium text-gray-700 hover:text-[#44ab48]"
              >
                Overview
              </a>
              <a
                href="/admin/registrations"
                className="text-sm font-medium text-gray-700 hover:text-[#44ab48]"
              >
                Registrations
              </a>
              <a
                href="/admin/stats"
                className="text-sm font-medium text-gray-700 hover:text-[#44ab48]"
              >
                Stats
              </a>
              <a
                href="/admin/check-in"
                className="text-sm font-medium text-gray-700 hover:text-[#44ab48]"
              >
                Check-in
              </a>
              <a
                href="/admin/stations"
                className="text-sm font-medium text-gray-700 hover:text-[#44ab48]"
              >
                Stations
              </a>
              <a
                href="/admin/teams"
                className="text-sm font-medium text-gray-700 hover:text-[#44ab48]"
              >
                Teams
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-12">{children}</main>
    </div>
  );
}
