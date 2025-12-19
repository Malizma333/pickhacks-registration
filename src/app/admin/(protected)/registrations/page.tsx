"use client";

import { useState, useEffect } from "react";
import { fetchEventRegistrations, fetchActiveEvent } from "~/server/actions/admin";
import { COLORS } from "~/constants";

// Types for registration data
interface HackerProfile {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
}

interface Education {
  school?: { name: string };
  levelOfStudy?: string;
}

interface DietaryRestrictionEntry {
  dietaryRestriction: { name: string };
  allergyDetails?: string | null;
}

interface Registration {
  id: string;
  qrCode: string;
  ageAtEvent: number;
  isComplete: boolean;
  createdAt: Date;
  hackerProfile: HackerProfile;
  education?: Education;
  dietaryRestrictions?: DietaryRestrictionEntry[];
}

interface EventData {
  id: string;
  name: string;
  year: number;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadRegistrations() {
      try {
        const event = await fetchActiveEvent();
        setActiveEvent(event as EventData | null);

        const result = await fetchEventRegistrations();
        if ("error" in result && result.error) {
          setErrorMessage(result.error);
        } else if ("registrations" in result) {
          setRegistrations(result.registrations as Registration[] || []);
        }
      } catch (err) {
        setErrorMessage("Failed to load registrations");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    void loadRegistrations();
  }, []);

  // Filter registrations based on search term
  const filteredRegistrations = registrations.filter((registration) => {
    const query = searchTerm.toLowerCase();
    const fullName = `${registration.hackerProfile.firstName} ${registration.hackerProfile.lastName}`.toLowerCase();
    const email = registration.hackerProfile.email?.toLowerCase() ?? "";
    const qrCode = registration.qrCode?.toLowerCase() ?? "";

    return fullName.includes(query) || email.includes(query) || qrCode.includes(query);
  });

  const handleExportCSV = () => {
    const csvHeaders = ["First Name", "Last Name", "Email", "Phone", "Age", "School", "Level of Study", "Dietary Restrictions", "QR Code", "Registration Date"];
    const csvRows = filteredRegistrations.map((registration) => [
      registration.hackerProfile.firstName,
      registration.hackerProfile.lastName,
      registration.hackerProfile.email ?? "",
      registration.hackerProfile.phoneNumber,
      registration.ageAtEvent,
      registration.education?.school?.name ?? "",
      registration.education?.levelOfStudy ?? "",
      registration.dietaryRestrictions && registration.dietaryRestrictions.length > 0
        ? registration.dietaryRestrictions.map((d) => d.dietaryRestriction.name).join("; ")
        : "None",
      registration.qrCode,
      new Date(registration.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `${activeEvent?.name ?? "registrations"}.csv`;
    downloadLink.click();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#44ab48] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-800">
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
          {activeEvent && (
            <p className="mt-1 text-gray-600">
              {activeEvent.name} - {filteredRegistrations.length} registrations
            </p>
          )}
        </div>
        <button
          onClick={handleExportCSV}
          className={`rounded-lg bg-[${COLORS.primary}] px-6 py-3 font-medium text-white shadow-sm transition hover:bg-[${COLORS.primaryHover}] hover:shadow`}
        >
          Export to CSV
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, email, or QR code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-[#44ab48] focus:outline-none focus:ring-4 focus:ring-[#44ab48]/10 focus:bg-white hover:border-gray-300"
        />
      </div>

      {/* Registrations Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Age
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  School
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Dietary
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  QR Code
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No registrations match your search"
                      : "No registrations yet"}
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((registration) => (
                  <tr
                    key={registration.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {registration.hackerProfile.firstName}{" "}
                          {registration.hackerProfile.lastName}
                        </div>
                        {registration.hackerProfile.email && (
                          <div className="text-sm text-gray-500">
                            {registration.hackerProfile.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {registration.hackerProfile.phoneNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {registration.ageAtEvent}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {registration.education?.school?.name ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {registration.education?.levelOfStudy ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {registration.dietaryRestrictions && registration.dietaryRestrictions.length > 0
                        ? registration.dietaryRestrictions
                            .map((d) => d.dietaryRestriction.name)
                            .join(", ")
                        : "None"}
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-800">
                        {registration.qrCode}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(registration.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <dt className="text-sm font-medium text-gray-500">
            Total Registrations
          </dt>
          <dd className="mt-2 text-3xl font-bold text-gray-900">
            {filteredRegistrations.length}
          </dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <dt className="text-sm font-medium text-gray-500">
            Complete Profiles
          </dt>
          <dd className={`mt-2 text-3xl font-bold text-[${COLORS.primary}]`}>
            {filteredRegistrations.filter((registration) => registration.isComplete).length}
          </dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <dt className="text-sm font-medium text-gray-500">
            Average Age
          </dt>
          <dd className="mt-2 text-3xl font-bold text-blue-600">
            {filteredRegistrations.length > 0
              ? Math.round(
                  filteredRegistrations.reduce(
                    (total, registration) => total + registration.ageAtEvent,
                    0
                  ) / filteredRegistrations.length
                )
              : 0}
          </dd>
        </div>
      </div>
    </div>
  );
}
