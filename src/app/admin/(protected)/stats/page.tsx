"use client";

import { useState, useEffect, useMemo } from "react";
import {
  fetchEventRegistrations,
  fetchActiveEvent,
} from "~/server/actions/admin";
import { COLORS } from "~/constants";
import { LoadingState } from "~/components/ui/LoadingSpinner";
import { AlertMessage } from "~/components/ui/AlertMessage";
import type { Registration } from "~/types/admin";

interface EventData {
  id: string;
  name: string;
  year: number;
}

function countBy<T>(
  items: T[],
  keyFn: (item: T) => string | null,
): [string, number][] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    if (key) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
}

export default function StatsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<Registration | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const event = await fetchActiveEvent();
        setActiveEvent(event as EventData | null);

        const result = await fetchEventRegistrations();
        if ("error" in result && result.error) {
          setErrorMessage(result.error);
        } else if ("registrations" in result) {
          setRegistrations((result.registrations as Registration[]) || []);
        }
      } catch (err) {
        setErrorMessage("Failed to load data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    void loadData();
  }, []);

  const completeRegistrations = useMemo(
    () => registrations.filter((r) => r.isComplete),
    [registrations],
  );

  const collegeCounts = useMemo(
    () =>
      countBy(completeRegistrations, (r) => r.education?.school?.name ?? null),
    [completeRegistrations],
  );

  const dietaryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of completeRegistrations) {
      if (r.dietaryRestrictions && r.dietaryRestrictions.length > 0) {
        for (const d of r.dietaryRestrictions) {
          const name = d.dietaryRestriction.name;
          counts.set(name, (counts.get(name) ?? 0) + 1);
        }
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [completeRegistrations]);

  const majorCounts = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    () => countBy(completeRegistrations, (r) => r.education?.major ?? null),
    [completeRegistrations],
  );

  const gradYearCounts = useMemo(() => {
    const entries = countBy(completeRegistrations, (r) =>
      r.education?.graduationYear ? String(r.education.graduationYear) : null,
    );
    return entries.sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [completeRegistrations]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase();
    return registrations.filter((r) => {
      const fullName =
        `${r.hackerProfile.firstName} ${r.hackerProfile.lastName}`.toLowerCase();
      const email = r.hackerProfile.user?.email?.toLowerCase() ?? "";
      return fullName.includes(query) || email.includes(query);
    });
  }, [searchTerm, registrations]);

  if (isLoading) {
    return <LoadingState message="Loading stats..." />;
  }

  if (errorMessage) {
    return <AlertMessage type="error" message={errorMessage} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Stats</h1>
        {activeEvent && (
          <p className="mt-1 text-gray-600">
            {activeEvent.name} — {completeRegistrations.length} complete
            registrations
          </p>
        )}
      </div>

      {/* User Lookup */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
            User Lookup
          </h2>
        </div>
        <div className="p-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedUser(null);
            }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 focus:border-[#44ab48] focus:bg-white focus:ring-4 focus:ring-[#44ab48]/10 focus:outline-none"
          />

          {searchTerm.trim() && !selectedUser && (
            <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-gray-200">
              {searchResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">
                  No users found
                </p>
              ) : (
                searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedUser(r)}
                    className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-gray-900">
                        {r.hackerProfile.firstName} {r.hackerProfile.lastName}
                      </span>
                      {r.hackerProfile.user?.email && (
                        <span className="block truncate text-sm text-gray-500 sm:ml-2 sm:inline">
                          {r.hackerProfile.user.email}
                        </span>
                      )}
                    </div>
                    <span
                      className={`self-start shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:self-auto ${r.isComplete ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {r.isComplete ? "Complete" : "Incomplete"}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {selectedUser && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.hackerProfile.firstName}{" "}
                  {selectedUser.hackerProfile.lastName}
                </h3>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchTerm("");
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.hackerProfile.user?.email ?? "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.hackerProfile.phoneNumber ?? "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Age at Event
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.ageAtEvent}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    School
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.education?.school?.name ?? "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Level of Study
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.education?.levelOfStudy ?? "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Major
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.education?.major ?? "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Expected Graduation
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.education?.graduationYear ?? "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Country
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.demographics?.countryOfResidence ?? "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Dietary Restrictions
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.dietaryRestrictions &&
                    selectedUser.dietaryRestrictions.length > 0
                      ? selectedUser.dietaryRestrictions
                          .map((d) => d.dietaryRestriction.name)
                          .join(", ")
                      : "None"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedUser.isComplete ? "Complete" : "Incomplete"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    QR Code
                  </dt>
                  <dd className="mt-1">
                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-800">
                      {selectedUser.qrCode}
                    </code>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Registered
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Colleges */}
        <BreakdownCard title="Colleges" data={collegeCounts} />

        {/* Majors */}
        <BreakdownCard title="Majors" data={majorCounts} />

        {/* Expected Graduation */}
        <BreakdownCard title="Expected Graduation" data={gradYearCounts} />

        {/* Dietary Restrictions */}
        <BreakdownCard title="Dietary Restrictions" data={dietaryCounts} />
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
}: {
  title: string;
  data: [string, number][];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
            {title}
          </h2>
          <span className="text-sm text-gray-500">{data.length} unique</span>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {data.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No data yet
          </p>
        ) : (
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              {data.map(([label, count]) => (
                <tr key={label} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">{label}</td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className={`inline-block min-w-8 rounded-full bg-[${COLORS.primaryLight}] px-2.5 py-0.5 text-center text-sm font-medium text-[${COLORS.primary}]`}
                    >
                      {count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
