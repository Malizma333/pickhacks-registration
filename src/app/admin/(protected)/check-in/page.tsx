"use client";

import { useState, useEffect, useCallback } from "react";
import { QRScanner } from "~/components/admin/QRScanner";
import { ManualQRInput } from "~/components/admin/ManualQRInput";
import { StationSelector } from "~/components/admin/StationSelector";
import { HackerInfoCard } from "~/components/admin/HackerInfoCard";
import { CheckInHistoryList } from "~/components/admin/CheckInHistoryList";
import { DuplicateWarningModal } from "~/components/admin/DuplicateWarningModal";
import { Button } from "~/components/ui/Button";
import { LoadingState, LoadingSpinner } from "~/components/ui/LoadingSpinner";
import { AlertMessage, SuccessBanner } from "~/components/ui/AlertMessage";
import { Card } from "~/components/ui/Card";
import {
  fetchEventStations,
  lookupRegistrationByQRCode,
  recordCheckIn,
} from "~/server/actions/check-in";
import type { Station, HackerInfo } from "~/types/admin";

const STORAGE_KEY = "pickhacks-admin-selected-station";

export default function CheckInPage() {
  // State
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [hackerInfo, setHackerInfo] = useState<HackerInfo | null>(null);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Duplicate warning modal state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{ checkedInAt: Date } | null>(null);

  // Load stations on mount
  useEffect(() => {
    async function loadStations() {
      try {
        const result = await fetchEventStations();
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.stations) {
          setStations(result.stations);

          // Restore saved station from localStorage
          const savedStationId = localStorage.getItem(STORAGE_KEY);
          if (savedStationId && result.stations.find((s) => s.id === savedStationId && s.isActive)) {
            setSelectedStationId(savedStationId);
          }
        }
      } catch (err) {
        setError("Failed to load stations");
        console.error(err);
      } finally {
        setIsLoadingStations(false);
      }
    }
    void loadStations();
  }, []);

  // Save station selection to localStorage
  const handleStationSelect = (stationId: string) => {
    setSelectedStationId(stationId);
    localStorage.setItem(STORAGE_KEY, stationId);
    // Clear any previous hacker info when changing stations
    resetState();
  };

  // Reset state for new scan
  const resetState = () => {
    setHackerInfo(null);
    setError(null);
    setSuccessMessage(null);
    setShowDuplicateModal(false);
    setDuplicateInfo(null);
  };

  // Handle QR code scan or manual entry
  const handleQRCode = useCallback(async (qrCode: string) => {
    resetState();
    setIsLookingUp(true);

    try {
      const result = await lookupRegistrationByQRCode(qrCode);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.registration) {
        setHackerInfo(result.registration);
      }
    } catch (err) {
      setError("Failed to lookup registration");
      console.error(err);
    } finally {
      setIsLookingUp(false);
    }
  }, []);

  // Handle check-in
  const handleCheckIn = async (overrideDuplicate = false, notes?: string) => {
    if (!hackerInfo || !selectedStationId) return;

    setIsCheckingIn(true);
    setError(null);

    try {
      const result = await recordCheckIn({
        eventRegistrationId: hackerInfo.id,
        eventStationId: selectedStationId,
        overrideDuplicate,
        notes,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.isDuplicate && result.previousCheckIn && !overrideDuplicate) {
        setDuplicateInfo({ checkedInAt: result.previousCheckIn.checkedInAt });
        setShowDuplicateModal(true);
        return;
      }

      // Success!
      const stationName = stations.find((s) => s.id === selectedStationId)?.name ?? "station";
      setSuccessMessage(
        `${hackerInfo.hackerProfile.firstName} checked in at ${stationName}!`
      );

      // Reset after a delay
      setTimeout(() => {
        resetState();
      }, 2000);
    } catch (err) {
      setError("Failed to record check-in");
      console.error(err);
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Handle duplicate override
  const handleDuplicateOverride = (notes?: string) => {
    setShowDuplicateModal(false);
    void handleCheckIn(true, notes);
  };

  // Get selected station info
  const selectedStation = stations.find((s) => s.id === selectedStationId);
  const isFoodStation = selectedStation?.stationType === "food";

  if (isLoadingStations) {
    return <LoadingState message="Loading..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Check-in</h1>
        <p className="mt-1 text-gray-600">
          Scan QR codes to check in attendees at stations
        </p>
      </div>

      {/* Station Selector */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <StationSelector
          stations={stations}
          selectedStationId={selectedStationId}
          onSelect={handleStationSelect}
          isLoading={isLoadingStations}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Scanner */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              QR Scanner
            </h2>
            <QRScanner
              onScan={handleQRCode}
              onError={(err) => setError(err)}
              isActive={!!selectedStationId}
            />
          </div>

          {/* Manual Entry */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Manual Entry
            </h2>
            <ManualQRInput onSubmit={handleQRCode} isLoading={isLookingUp} />
          </div>
        </div>

        {/* Right: Hacker Info */}
        <div className="space-y-4">
          {/* Success Message */}
          {successMessage && <SuccessBanner message={successMessage} />}

          {/* Error Message */}
          {error && !successMessage && (
            <AlertMessage type="error" message={error} onDismiss={() => setError(null)} />
          )}

          {/* Loading State */}
          {isLookingUp && (
            <Card className="p-12 text-center">
              <LoadingSpinner size="md" className="mb-4" />
              <p className="text-gray-600">Looking up registration...</p>
            </Card>
          )}

          {/* Hacker Info Card */}
          {hackerInfo && !isLookingUp && !successMessage && (
            <>
              <HackerInfoCard
                hacker={hackerInfo.hackerProfile}
                dietaryRestrictions={hackerInfo.dietaryRestrictions}
                isComplete={hackerInfo.isComplete}
                showDietaryProminent={isFoodStation}
              />

              {/* Check-in History */}
              <Card>
                <CheckInHistoryList
                  checkIns={hackerInfo.checkIns}
                  currentStationId={selectedStationId ?? undefined}
                />
              </Card>

              {/* Check-in Button */}
              <Button
                onClick={() => handleCheckIn(false)}
                disabled={isCheckingIn || !selectedStationId}
                variant="primary"
                className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                {isCheckingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                    Checking in...
                  </span>
                ) : (
                  `Check In at ${selectedStation?.name ?? "Station"}`
                )}
              </Button>
            </>
          )}

          {/* Empty State */}
          {!hackerInfo && !isLookingUp && !successMessage && !error && (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <p className="text-gray-500">
                {selectedStationId
                  ? "Scan a QR code to view hacker info"
                  : "Select a station to start scanning"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Duplicate Warning Modal */}
      {duplicateInfo && selectedStation && (
        <DuplicateWarningModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          onConfirm={handleDuplicateOverride}
          stationName={selectedStation.name}
          previousCheckIn={duplicateInfo}
          isSubmitting={isCheckingIn}
        />
      )}
    </div>
  );
}
