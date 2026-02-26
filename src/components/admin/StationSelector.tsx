"use client";

import { Select } from "~/components/ui/Select";

interface Station {
  id: string;
  name: string;
  stationType: string;
  isActive: boolean;
}

interface StationSelectorProps {
  stations: Station[];
  selectedStationId: string | null;
  onSelect: (stationId: string) => void;
  isLoading?: boolean;
}

const stationTypeLabels: Record<string, string> = {
  checkin: "Check-in",
  food: "Food",
  workshop: "Workshop",
  prize: "Prize",
};

export function StationSelector({
  stations,
  selectedStationId,
  onSelect,
  isLoading = false,
}: StationSelectorProps) {
  // Only show active stations
  const activeStations = stations.filter((s) => s.isActive);

  // Sort stations by type for better grouping
  const sortedStations = [...activeStations].sort((a, b) => {
    const typeOrder = ["checkin", "food", "workshop", "prize"];
    return typeOrder.indexOf(a.stationType) - typeOrder.indexOf(b.stationType);
  });

  const options = sortedStations.map((station) => ({
    value: station.id,
    label: `${station.name} (${stationTypeLabels[station.stationType] ?? station.stationType})`,
  }));

  if (activeStations.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        <p className="font-medium">No active stations</p>
        <p className="text-yellow-700">
          Please create or activate stations in the{" "}
          <a href="/admin/stations" className="underline hover:no-underline">
            Stations page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Current Station
      </label>
      <Select
        name="stationSelector"
        value={selectedStationId ?? ""}
        onChange={onSelect}
        options={options}
        placeholder="Select a station to scan..."
        disabled={isLoading}
      />
    </div>
  );
}
