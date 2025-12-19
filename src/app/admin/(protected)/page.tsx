"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { FormInput } from "~/components/ui/FormInput";
import {
  createEvent,
  deleteEvent,
  fetchActiveEvent,
  fetchRegistrationStats,
  canCreateEvent,
} from "~/server/actions/admin";
import { COLORS } from "~/constants";

interface EventData {
  id: string;
  name: string;
  year: number;
  startDate: Date;
  endDate: Date;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  isActive: boolean;
}

interface RegistrationStats {
  totalRegistrations: number;
  completeRegistrations: number;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function hasEventEnded(endDate: Date | string): boolean {
  return new Date() > new Date(endDate);
}

export default function AdminPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);
  const [registrationStats, setRegistrationStats] = useState<RegistrationStats | null>(null);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [canCreateNewEvent, setCanCreateNewEvent] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [eventFormData, setEventFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
    registrationOpensAt: "",
    registrationClosesAt: "",
  });

  async function loadEventData() {
    setIsLoadingData(true);
    const event = await fetchActiveEvent();
    setActiveEvent(event as EventData | null);

    if (event) {
      const statsResult = await fetchRegistrationStats();
      if (!("error" in statsResult) && statsResult.stats) {
        setRegistrationStats(statsResult.stats);
      }
    }

    const createCheck = await canCreateEvent();
    setCanCreateNewEvent(createCheck.canCreate);
    setIsLoadingData(false);
  }

  useEffect(() => {
    void loadEventData();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await createEvent(eventFormData);

    if ("error" in result) {
      setErrorMessage(result.error);
    } else {
      setSuccessMessage(`Event "${eventFormData.name}" created successfully!`);
      setIsCreateFormVisible(false);
      setEventFormData({
        name: "",
        year: new Date().getFullYear(),
        startDate: "",
        endDate: "",
        registrationOpensAt: "",
        registrationClosesAt: "",
      });
      void loadEventData();
    }
    setIsSubmitting(false);
  };

  const handleDeleteEvent = async () => {
    if (!activeEvent) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${activeEvent.name}"? This action cannot be undone.`
    );

    if (!isConfirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);

    const result = await deleteEvent(activeEvent.id);

    if ("error" in result) {
      setErrorMessage(result.error);
    } else {
      setSuccessMessage("Event deleted successfully");
      setActiveEvent(null);
      setRegistrationStats(null);
      void loadEventData();
    }
    setIsDeleting(false);
  };

  if (isLoadingData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[${COLORS.primary}] border-r-transparent`} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          {successMessage}
        </div>
      )}

      {activeEvent ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className={`bg-linear-to-r from-[${COLORS.primary}] to-[${COLORS.primaryHover}] px-8 py-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Active Event</p>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {activeEvent.name}
                </h2>
              </div>
              {hasEventEnded(activeEvent.endDate) && (
                <span className="rounded-full bg-yellow-400 px-4 py-1 text-sm font-semibold text-yellow-900">
                  Event Ended
                </span>
              )}
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Start Date
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatDate(activeEvent.startDate)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  End Date
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatDate(activeEvent.endDate)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Registration Opens
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {activeEvent.registrationOpensAt
                    ? formatDate(activeEvent.registrationOpensAt)
                    : "—"}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Registration Closes
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {activeEvent.registrationClosesAt
                    ? formatDate(activeEvent.registrationClosesAt)
                    : "—"}
                </p>
              </div>
            </div>

            {registrationStats && (
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Registration Statistics
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className={`rounded-xl bg-[${COLORS.primaryLight}] p-6`}>
                    <p className="text-sm font-medium text-[#2d7a32]">
                      Total Registrations
                    </p>
                    <p className={`mt-2 text-4xl font-bold text-[${COLORS.primary}]`}>
                      {registrationStats.totalRegistrations}
                    </p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-6">
                    <p className="text-sm font-medium text-blue-700">
                      Complete Registrations
                    </p>
                    <p className="mt-2 text-4xl font-bold text-blue-600">
                      {registrationStats.completeRegistrations}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-8 mt-8 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {canCreateNewEvent
                  ? "This event has ended. You can create a new event."
                  : "Only one active event is allowed at a time."}
              </p>
              <button
                onClick={handleDeleteEvent}
                disabled={isDeleting}
                className="rounded-lg border-2 border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No Active Event</h3>
          <p className="mt-2 text-gray-600">
            Create an event to start accepting registrations.
          </p>
        </div>
      )}

      {canCreateNewEvent && !isCreateFormVisible && (
        <div className="flex justify-center">
          <Button onClick={() => setIsCreateFormVisible(true)} variant="primary">
            Create New Event
          </Button>
        </div>
      )}

      {isCreateFormVisible && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Create New Event
              </h2>
              <button
                onClick={() => setIsCreateFormVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateEvent} className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <FormInput
                  type="text"
                  name="name"
                  value={eventFormData.name}
                  onChange={(e) =>
                    setEventFormData({ ...eventFormData, name: e.target.value })
                  }
                  placeholder="PickHacks 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <FormInput
                  type="number"
                  name="year"
                  value={eventFormData.year.toString()}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      year: parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  required
                  min={2020}
                  max={2050}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <FormInput
                  type="date"
                  name="startDate"
                  value={eventFormData.startDate}
                  onChange={(e) =>
                    setEventFormData({ ...eventFormData, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <FormInput
                  type="date"
                  name="endDate"
                  value={eventFormData.endDate}
                  onChange={(e) =>
                    setEventFormData({ ...eventFormData, endDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Opens
                  <span className="text-gray-400 font-normal"> (optional)</span>
                </label>
                <FormInput
                  type="datetime-local"
                  name="registrationOpensAt"
                  value={eventFormData.registrationOpensAt}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      registrationOpensAt: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Closes
                  <span className="text-gray-400 font-normal"> (optional)</span>
                </label>
                <FormInput
                  type="datetime-local"
                  name="registrationClosesAt"
                  value={eventFormData.registrationClosesAt}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      registrationClosesAt: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCreateFormVisible(false)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
