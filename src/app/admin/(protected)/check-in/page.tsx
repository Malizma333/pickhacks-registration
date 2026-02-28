"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { QRScanner } from "~/components/admin/QRScanner";
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
  searchRegistrationsByName,
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

  // Name search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HackerInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced name search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      void (async () => {
        try {
          const result = await searchRegistrationsByName(searchQuery);
          if (result.error) {
            setError(result.error);
            setSearchResults([]);
          } else if (result.registrations) {
            setSearchResults(result.registrations as HackerInfo[]);
          }
        } catch (err) {
          console.error(err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Save station selection to localStorage
  const handleStationSelect = (stationId: string) => {
    setSelectedStationId(stationId);
    localStorage.setItem(STORAGE_KEY, stationId);
    resetState();
  };

  // Reset state
  const resetState = () => {
    setHackerInfo(null);
    setError(null);
    setSuccessMessage(null);
    setShowDuplicateModal(false);
    setDuplicateInfo(null);
  };

  // Handle QR code scan
  const handleQRCode = useCallback(async (qrCode: string) => {
    resetState();
    setSearchQuery("");
    setSearchResults([]);
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

  // Select a hacker from search results
  const handleSelectHacker = (hacker: HackerInfo) => {
    setHackerInfo(hacker);
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
    setSuccessMessage(null);
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Check-in</h1>
        <p className="mt-1 text-gray-600">
          Scan a QR code or search by name to check in attendees
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
        {/* Left: Scanner + Name Search */}
        <div className="space-y-4">
          {/* QR Scanner */}
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

          {/* Name Search */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Search by Name
            </h2>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a name to search..."
                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={!selectedStationId}
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchQuery.trim().length >= 2 && !hackerInfo && (
              <div className="mt-2">
                {isSearching ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 max-h-64 overflow-y-auto">
                    {searchResults.map((reg) => (
                      <button
                        key={reg.id}
                        onClick={() => handleSelectHacker(reg)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {reg.hackerProfile.firstName} {reg.hackerProfile.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {reg.education?.school?.name ?? "No school listed"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {reg.isComplete ? (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                              Registered
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                              Incomplete
                            </span>
                          )}
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                    No attendees found for &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Attendee Details
                </h2>
                <button
                  onClick={resetState}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>

              <HackerInfoCard
                hacker={hackerInfo.hackerProfile}
                ageAtEvent={hackerInfo.ageAtEvent}
                education={hackerInfo.education}
                shipping={hackerInfo.shipping}
                demographics={hackerInfo.demographics}
                dietaryRestrictions={hackerInfo.dietaryRestrictions}
                isComplete={hackerInfo.isComplete}
                showDietaryProminent={isFoodStation}
                resumeUrl={hackerInfo.resumeUrl}
                resumeFileName={hackerInfo.resumeFileName}
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
                  ? "Scan a QR code or search by name"
                  : "Select a station to start"}
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
