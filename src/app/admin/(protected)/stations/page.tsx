"use client";

import { useState, useEffect } from "react";
import { StationCard } from "~/components/admin/StationCard";
import { CreateStationForm } from "~/components/admin/CreateStationForm";
import {
  fetchEventStations,
  createStation,
  toggleStationActive,
  deleteStation,
  seedDefaultStations,
  getStationStats,
} from "~/server/actions/check-in";
import { COLORS } from "~/constants";

interface Station {
  id: string;
  name: string;
  stationType: string;
  isActive: boolean;
  maxVisitsPerHacker: number | null;
}

interface StationStats {
  stationId: string;
  stationName: string;
  stationType: string;
  isActive: boolean;
  maxVisitsPerHacker: number | null;
  totalCheckIns: number;
  uniqueHackers: number;
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [stats, setStats] = useState<StationStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [stationsResult, statsResult] = await Promise.all([
        fetchEventStations(),
        getStationStats(),
      ]);

      if (stationsResult.error) {
        setError(stationsResult.error);
        return;
      }

      if (stationsResult.stations) {
        setStations(stationsResult.stations);
      }

      if (statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (err) {
      setError("Failed to load stations");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreateStation = async (data: {
    name: string;
    stationType: string;
    maxVisitsPerHacker: number | null;
  }) => {
    setIsCreating(true);
    try {
      const result = await createStation(data);
      if (result.error) {
        setError(result.error);
      } else {
        setShowCreateForm(false);
        await loadData();
      }
    } catch (err) {
      setError("Failed to create station");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (stationId: string) => {
    try {
      const result = await toggleStationActive(stationId);
      if (result.error) {
        setError(result.error);
      } else {
        await loadData();
      }
    } catch (err) {
      setError("Failed to toggle station");
      console.error(err);
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm("Are you sure you want to delete this station?")) return;

    setDeletingId(stationId);
    try {
      const result = await deleteStation(stationId);
      if (result.error) {
        setError(result.error);
      } else {
        await loadData();
      }
    } catch (err) {
      setError("Failed to delete station");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDefaultStations();
      if (result.error) {
        setError(result.error);
      } else {
        await loadData();
      }
    } catch (err) {
      setError("Failed to seed default stations");
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const getStatsForStation = (stationId: string) => {
    const stationStats = stats.find((s) => s.stationId === stationId);
    return stationStats
      ? { totalCheckIns: stationStats.totalCheckIns, uniqueHackers: stationStats.uniqueHackers }
      : undefined;
  };

  // Group stations by type
  const checkinStations = stations.filter((s) => s.stationType === "checkin");
  const foodStations = stations.filter((s) => s.stationType === "food");
  const workshopStations = stations.filter((s) => s.stationType === "workshop");
  const prizeStations = stations.filter((s) => s.stationType === "prize");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#44ab48] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stations</h1>
          <p className="mt-1 text-gray-600">
            Manage check-in stations for the event
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className={`rounded-lg bg-[${COLORS.primary}] px-6 py-3 font-medium text-white shadow-sm transition hover:bg-[${COLORS.primaryHover}] hover:shadow`}
        >
          + New Station
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-600 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Create New Station
            </h2>
            <CreateStationForm
              onSubmit={handleCreateStation}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={isCreating}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {stations.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No stations yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create stations to start tracking check-ins at your event.
          </p>
          <button
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className={`rounded-lg bg-[${COLORS.primary}] px-6 py-3 font-medium text-white shadow-sm transition hover:bg-[${COLORS.primaryHover}] hover:shadow disabled:opacity-50`}
          >
            {isSeeding ? "Creating..." : "Create Default Stations"}
          </button>
        </div>
      )}

      {/* Stations Grid by Type */}
      {checkinStations.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
            Check-in Stations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkinStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                stats={getStatsForStation(station.id)}
                onToggleActive={() => handleToggleActive(station.id)}
                onDelete={() => handleDeleteStation(station.id)}
                isDeleting={deletingId === station.id}
              />
            ))}
          </div>
        </div>
      )}

      {foodStations.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
            Food Stations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foodStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                stats={getStatsForStation(station.id)}
                onToggleActive={() => handleToggleActive(station.id)}
                onDelete={() => handleDeleteStation(station.id)}
                isDeleting={deletingId === station.id}
              />
            ))}
          </div>
        </div>
      )}

      {workshopStations.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
            Workshop Stations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workshopStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                stats={getStatsForStation(station.id)}
                onToggleActive={() => handleToggleActive(station.id)}
                onDelete={() => handleDeleteStation(station.id)}
                isDeleting={deletingId === station.id}
              />
            ))}
          </div>
        </div>
      )}

      {prizeStations.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
            Prize Stations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prizeStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                stats={getStatsForStation(station.id)}
                onToggleActive={() => handleToggleActive(station.id)}
                onDelete={() => handleDeleteStation(station.id)}
                isDeleting={deletingId === station.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
