"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { FormInput } from "~/components/ui/FormInput";
import {
  createEvent,
  deleteEvent,
  updateEvent,
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
  totalAccounts: number;
  completeRegistrations: number;
}

interface AccountEntry {
  name: string;
  email: string;
  createdAt: Date | string;
}

interface RegistrationEntry {
  name: string;
  createdAt: Date | string;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function hasEventEnded(endDate: Date | string): boolean {
  return new Date() > new Date(endDate);
}

function toDateInputValue(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0] ?? "";
}

function toDatetimeInputValue(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function AdminPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);
  const [registrationStats, setRegistrationStats] =
    useState<RegistrationStats | null>(null);
  const [accountsList, setAccountsList] = useState<AccountEntry[]>([]);
  const [registrationsList, setRegistrationsList] = useState<RegistrationEntry[]>([]);
  const [expandedStat, setExpandedStat] = useState<"accounts" | "registrations" | null>(null);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [canCreateNewEvent, setCanCreateNewEvent] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
    registrationOpensAt: "",
    registrationClosesAt: "",
  });

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
        setAccountsList((statsResult.accounts as AccountEntry[]) ?? []);
        setRegistrationsList((statsResult.registrations as RegistrationEntry[]) ?? []);
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
      `Are you sure you want to delete "${activeEvent.name}"? This action cannot be undone.`,
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

  const startEditing = () => {
    if (!activeEvent) return;
    setEditFormData({
      name: activeEvent.name,
      year: activeEvent.year,
      startDate: toDateInputValue(activeEvent.startDate),
      endDate: toDateInputValue(activeEvent.endDate),
      registrationOpensAt: toDatetimeInputValue(
        activeEvent.registrationOpensAt,
      ),
      registrationClosesAt: toDatetimeInputValue(
        activeEvent.registrationClosesAt,
      ),
    });
    setIsEditing(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await updateEvent(activeEvent.id, editFormData);

    if ("error" in result) {
      setErrorMessage(result.error);
    } else {
      setSuccessMessage("Event updated successfully!");
      setIsEditing(false);
      void loadEventData();
    }
    setIsSaving(false);
  };

  if (isLoadingData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div
          className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[${COLORS.primary}] border-r-transparent`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          {successMessage}
        </div>
      )}

      {activeEvent ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div
            className={`bg-linear-to-r from-[${COLORS.primary}] to-[${COLORS.primaryHover}] px-4 py-4 sm:px-8 sm:py-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Active Event</p>
                <h2 className="mt-1 text-xl sm:text-2xl font-bold text-black">
                  {activeEvent.name}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {hasEventEnded(activeEvent.endDate) && (
                  <span className="rounded-full bg-yellow-400 px-4 py-1 text-sm font-semibold text-yellow-900">
                    Event Ended
                  </span>
                )}
                {!isEditing && (
                  <button
                    onClick={startEditing}
                    className="rounded-lg bg-black/10 px-4 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/20"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            {isEditing ? (
              <form onSubmit={handleUpdateEvent} className="mb-8 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Event Name
                    </label>
                    <FormInput
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <FormInput
                      type="number"
                      name="year"
                      value={editFormData.year.toString()}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          year:
                            parseInt(e.target.value) ||
                            new Date().getFullYear(),
                        })
                      }
                      required
                      min={2020}
                      max={2050}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <FormInput
                      type="date"
                      name="startDate"
                      value={editFormData.startDate}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          startDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <FormInput
                      type="date"
                      name="endDate"
                      value={editFormData.endDate}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          endDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Registration Opens
                      <span className="font-normal text-gray-400">
                        {" "}
                        (optional)
                      </span>
                    </label>
                    <FormInput
                      type="datetime-local"
                      name="registrationOpensAt"
                      value={editFormData.registrationOpensAt}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          registrationOpensAt: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Registration Closes
                      <span className="font-normal text-gray-400">
                        {" "}
                        (optional)
                      </span>
                    </label>
                    <FormInput
                      type="datetime-local"
                      name="registrationClosesAt"
                      value={editFormData.registrationClosesAt}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          registrationClosesAt: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Start Date
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDate(activeEvent.startDate)}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    End Date
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDate(activeEvent.endDate)}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Registration Opens
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {activeEvent.registrationOpensAt
                      ? formatDate(activeEvent.registrationOpensAt)
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Registration Closes
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {activeEvent.registrationClosesAt
                      ? formatDate(activeEvent.registrationClosesAt)
                      : "—"}
                  </p>
                </div>
              </div>
            )}

            {registrationStats && (
              <div className="border-t border-gray-100 pt-8">
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                  Registration Statistics
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  <button
                    type="button"
                    onClick={() => setExpandedStat(expandedStat === "accounts" ? null : "accounts")}
                    className={`rounded-xl bg-[${COLORS.primaryLight}] p-4 sm:p-6 text-left transition-shadow hover:shadow-md cursor-pointer ${expandedStat === "accounts" ? "ring-2 ring-[#44ab48]" : ""}`}
                  >
                    <p className="text-sm font-medium text-[#2d7a32]">
                      Total Accounts
                    </p>
                    <p
                      className={`mt-2 text-3xl sm:text-4xl font-bold text-[${COLORS.primary}]`}
                    >
                      {registrationStats.totalAccounts}
                    </p>
                    <p className="mt-1 text-xs text-[#2d7a32]">
                      {expandedStat === "accounts" ? "Click to collapse" : "Click to view"}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedStat(expandedStat === "registrations" ? null : "registrations")}
                    className={`rounded-xl bg-blue-50 p-4 sm:p-6 text-left transition-shadow hover:shadow-md cursor-pointer ${expandedStat === "registrations" ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <p className="text-sm font-medium text-blue-700">
                      Complete Registrations
                    </p>
                    <p className="mt-2 text-3xl sm:text-4xl font-bold text-blue-600">
                      {registrationStats.completeRegistrations}
                    </p>
                    <p className="mt-1 text-xs text-blue-600">
                      {expandedStat === "registrations" ? "Click to collapse" : "Click to view"}
                    </p>
                  </button>
                </div>

                {expandedStat === "accounts" && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                      <h4 className="text-sm font-semibold text-gray-900">
                        All Accounts ({accountsList.length})
                      </h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {accountsList.map((account, i) => (
                        <div key={i} className="flex items-center justify-between px-6 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{account.name}</p>
                            <p className="text-xs text-gray-500">{account.email}</p>
                          </div>
                          <p className="text-xs text-gray-400">
                            {formatDateTime(account.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {expandedStat === "registrations" && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Complete Registrations ({registrationsList.length})
                      </h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {registrationsList.map((reg, i) => (
                        <div key={i} className="flex items-center justify-between px-6 py-3">
                          <p className="text-sm font-medium text-gray-900">{reg.name}</p>
                          <p className="text-xs text-gray-400">
                            {formatDateTime(reg.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-8">
              <p className="text-sm text-gray-500">
                {canCreateNewEvent
                  ? "This event has ended. You can create a new event."
                  : "Only one active event is allowed at a time."}
              </p>
              {/*
                <button
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                  className="rounded-lg border-2 border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Event"}
                </button>{" "}
              */}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
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
          <h3 className="text-lg font-semibold text-gray-900">
            No Active Event
          </h3>
          <p className="mt-2 text-gray-600">
            Create an event to start accepting registrations.
          </p>
        </div>
      )}

      {canCreateNewEvent && !isCreateFormVisible && (
        <div className="flex justify-center">
          <Button
            onClick={() => setIsCreateFormVisible(true)}
            variant="primary"
          >
            Create New Event
          </Button>
        </div>
      )}

      {isCreateFormVisible && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-8">
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

          <form onSubmit={handleCreateEvent} className="space-y-6 p-4 sm:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Year
                </label>
                <FormInput
                  type="number"
                  name="year"
                  value={eventFormData.year.toString()}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      year:
                        parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  required
                  min={2020}
                  max={2050}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <FormInput
                  type="date"
                  name="startDate"
                  value={eventFormData.startDate}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      startDate: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <FormInput
                  type="date"
                  name="endDate"
                  value={eventFormData.endDate}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      endDate: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Registration Opens
                  <span className="font-normal text-gray-400"> (optional)</span>
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
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Registration Closes
                  <span className="font-normal text-gray-400"> (optional)</span>
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

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateFormVisible(false)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
