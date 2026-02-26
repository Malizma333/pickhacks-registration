"use client";

import { COLORS } from "~/constants";

interface StationCardProps {
  station: {
    id: string;
    name: string;
    stationType: string;
    isActive: boolean;
    maxVisitsPerHacker: number | null;
  };
  stats?: {
    totalCheckIns: number;
    uniqueHackers: number;
  };
  onToggleActive: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const stationTypeLabels: Record<string, string> = {
  checkin: "Check-in",
  food: "Food/Meal",
  workshop: "Workshop",
  prize: "Prize",
};

const stationTypeColors: Record<string, string> = {
  checkin: "bg-blue-100 text-blue-800",
  food: "bg-orange-100 text-orange-800",
  workshop: "bg-purple-100 text-purple-800",
  prize: "bg-yellow-100 text-yellow-800",
};

export function StationCard({
  station,
  stats,
  onToggleActive,
  onDelete,
  isDeleting = false,
}: StationCardProps) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm transition-all ${
        station.isActive
          ? "border-gray-200 hover:shadow-md"
          : "border-gray-200 bg-gray-50 opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{station.name}</h3>
          <span
            className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
              stationTypeColors[station.stationType] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {stationTypeLabels[station.stationType] ?? station.stationType}
          </span>
        </div>
        {!station.isActive && (
          <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-200 rounded">
            Inactive
          </span>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalCheckIns}
            </div>
            <div className="text-xs text-gray-500">Total Check-ins</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.uniqueHackers}
            </div>
            <div className="text-xs text-gray-500">Unique Hackers</div>
          </div>
        </div>
      )}

      {/* Max visits info */}
      <div className="text-xs text-gray-500 mb-4">
        {station.maxVisitsPerHacker === null
          ? "Unlimited visits per hacker"
          : station.maxVisitsPerHacker === 1
          ? "One visit per hacker"
          : `Max ${station.maxVisitsPerHacker} visits per hacker`}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onToggleActive}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            station.isActive
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : `bg-[${COLORS.primary}] text-white hover:bg-[${COLORS.primaryHover}]`
          }`}
        >
          {station.isActive ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting || (stats && stats.totalCheckIns > 0)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            stats && stats.totalCheckIns > 0
              ? "Cannot delete station with check-ins"
              : undefined
          }
        >
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
