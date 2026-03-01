"use client";

import { useState, useEffect } from "react";
import {
  fetchAllTeams,
  fetchActiveEvent,
} from "~/server/actions/admin";
import { COLORS } from "~/constants";
import { TRACKS } from "~/constants";
import { LoadingState } from "~/components/ui/LoadingSpinner";
import { AlertMessage } from "~/components/ui/AlertMessage";

interface TeamMember {
  registrationId: string;
  firstName: string;
  lastName: string;
  isCaptain: boolean;
}

interface TeamData {
  id: string;
  name: string;
  projectName: string | null;
  devpostUrl: string | null;
  captainRegistrationId: string;
  createdAt: Date;
  tracks: string[];
  members: TeamMember[];
}

interface EventData {
  id: string;
  name: string;
  year: number;
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadTeams() {
      try {
        const event = await fetchActiveEvent();
        setActiveEvent(event as EventData | null);

        const result = await fetchAllTeams();
        if ("error" in result && result.error) {
          setErrorMessage(result.error);
        } else if ("teams" in result) {
          setTeams((result.teams as TeamData[]) || []);
        }
      } catch (err) {
        setErrorMessage("Failed to load teams");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    void loadTeams();
  }, []);

  const filteredTeams = teams.filter((t) => {
    const query = searchTerm.toLowerCase();
    const teamName = t.name.toLowerCase();
    const projectName = t.projectName?.toLowerCase() ?? "";
    const memberNames = t.members
      .map((m) => `${m.firstName} ${m.lastName}`.toLowerCase())
      .join(" ");

    return (
      teamName.includes(query) ||
      projectName.includes(query) ||
      memberNames.includes(query)
    );
  });

  const totalHackersOnTeams = teams.reduce((sum, t) => sum + t.members.length, 0);
  const avgTeamSize =
    teams.length > 0
      ? (totalHackersOnTeams / teams.length).toFixed(1)
      : "0";

  const handleExportCSV = () => {
    const csvHeaders = [
      "Team Name",
      "Project Name",
      "Devpost URL",
      "Captain",
      "Members",
      "Member Count",
      "Tracks",
      "Created",
    ];

    const csvRows = filteredTeams.map((t) => {
      const captain = t.members.find((m) => m.isCaptain);
      const captainName = captain
        ? `${captain.firstName} ${captain.lastName}`
        : "";
      const memberNames = t.members
        .map((m) => `${m.firstName} ${m.lastName}`)
        .join("; ");
      const trackLabels = t.tracks
        .map((tv) => {
          const def = TRACKS.find((tr) => tr.value === tv);
          return def?.label ?? tv;
        })
        .join("; ");

      return [
        `"${t.name.replace(/"/g, '""')}"`,
        `"${(t.projectName ?? "").replace(/"/g, '""')}"`,
        `"${(t.devpostUrl ?? "").replace(/"/g, '""')}"`,
        `"${captainName}"`,
        `"${memberNames}"`,
        t.members.length,
        `"${trackLabels}"`,
        new Date(t.createdAt).toLocaleDateString(),
      ];
    });

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = `${activeEvent?.name ?? "teams"}-teams.csv`;
    downloadLink.click();
  };

  if (isLoading) {
    return <LoadingState message="Loading teams..." />;
  }

  if (errorMessage) {
    return <AlertMessage type="error" message={errorMessage} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teams</h1>
          {activeEvent && (
            <p className="mt-1 text-gray-600">
              {activeEvent.name} - {filteredTeams.length} teams
            </p>
          )}
        </div>
        <button
          onClick={handleExportCSV}
          className={`w-full sm:w-auto rounded-lg bg-[${COLORS.primary}] px-6 py-3 font-medium text-white shadow-sm transition hover:bg-[${COLORS.primaryHover}] hover:shadow`}
        >
          Export to CSV
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <input
          type="text"
          placeholder="Search by team name, project name, or member name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 focus:border-[#44ab48] focus:bg-white focus:ring-4 focus:ring-[#44ab48]/10 focus:outline-none"
        />
      </div>

      {/* Teams Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Team Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Project
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Devpost
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Members
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Tracks
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No teams match your search"
                      : "No teams yet"}
                  </td>
                </tr>
              ) : (
                filteredTeams.map((t) => (
                  <tr
                    key={t.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{t.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {t.projectName ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {t.devpostUrl ? (
                        <a
                          href={t.devpostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#44ab48] hover:underline"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {t.members.map((m) => (
                          <div key={m.registrationId} className="text-sm text-gray-700">
                            {m.firstName} {m.lastName}
                            {m.isCaptain && (
                              <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                Captain
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {t.tracks.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {t.tracks.map((tv) => {
                            const def = TRACKS.find((tr) => tr.value === tv);
                            return (
                              <span
                                key={tv}
                                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700"
                              >
                                {def?.label ?? tv}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(t.createdAt).toLocaleDateString()}
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
          <dt className="text-sm font-medium text-gray-500">Total Teams</dt>
          <dd className="mt-2 text-3xl font-bold text-gray-900">
            {teams.length}
          </dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <dt className="text-sm font-medium text-gray-500">
            Hackers on Teams
          </dt>
          <dd className={`mt-2 text-3xl font-bold text-[${COLORS.primary}]`}>
            {totalHackersOnTeams}
          </dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <dt className="text-sm font-medium text-gray-500">
            Avg Team Size
          </dt>
          <dd className="mt-2 text-3xl font-bold text-blue-600">
            {avgTeamSize}
          </dd>
        </div>
      </div>
    </div>
  );
}
