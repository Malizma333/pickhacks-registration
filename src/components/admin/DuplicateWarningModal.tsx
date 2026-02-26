"use client";

import { useState } from "react";
import { Button } from "~/components/ui/Button";

interface DuplicateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  stationName: string;
  previousCheckIn: {
    checkedInAt: Date;
  };
  isSubmitting?: boolean;
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function DuplicateWarningModal({
  isOpen,
  onClose,
  onConfirm,
  stationName,
  previousCheckIn,
  isSubmitting = false,
}: DuplicateWarningModalProps) {
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
    setNotes("");
  };

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
        {/* Warning Header */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800">
                Duplicate Check-in
              </h3>
              <p className="text-sm text-amber-700">
                This person was already checked in
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="rounded-lg bg-gray-50 p-4 mb-4">
            <div className="text-sm text-gray-600 mb-1">Previous check-in at</div>
            <div className="font-medium text-gray-900">{stationName}</div>
            <div className="text-sm text-gray-500">
              {formatDateTime(previousCheckIn.checkedInAt)}
            </div>
          </div>

          <div>
            <label
              htmlFor="override-notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Override Reason (optional)
            </label>
            <textarea
              id="override-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter reason for allowing duplicate check-in..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#44ab48] focus:outline-none focus:ring-4 focus:ring-[#44ab48]/10 focus:bg-white resize-none"
              rows={2}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Checking in..." : "Check In Anyway"}
          </Button>
        </div>
      </div>
    </div>
  );
}
