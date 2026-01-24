"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { getRegistrationStatus } from "~/server/actions/registration";

function ApplicationSubmitted() {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#44ab48]">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Registration Submitted
          </h1>
          <p className="mt-1 text-gray-600">
            Thank you for registering for PickHacks 2025! We&apos;ll email you
            with updates and event details.
          </p>
        </div>
      </div>
    </div>
  );
}

function ApplicationInProgress() {
  return (
    <div className="mb-6 rounded-xl border border-yellow-400 bg-yellow-50 p-8 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-yellow-400">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
        </div>

        {/* Text */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Registration Incomplete
          </h1>
          <p className="mt-1 text-gray-700">
            Your registration for PickHacks 2025 is incomplete.
            No spot is reserved until you submit your registration.
          </p>
        </div>
      </div>
    </div>
  );
}

function ApplicationStatusSkeleton() {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gray-300" />

        <div className="flex-1 space-y-2">
          <div className="h-6 w-3/4 rounded bg-gray-300" />
          <div className="h-4 w-5/6 rounded bg-gray-300" />
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noRegistration, setNoRegistration] = useState(false);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const status = await getRegistrationStatus();
        if (status.registered && status.qrCode) {
          // Generate QR code URL from the QR code string stored in database
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(status.qrCode)}`;
          setQrCodeUrl(qrUrl);
        } else {
          setNoRegistration(true);
          setError("No registration found.");
        }
      } catch (error) {
        console.error("Error fetching QR code:", error);
        setError("Failed to load QR code.");
      } finally {
        setLoading(false);
      }
    };

    void fetchQRCode();
  }, []);

  return (
    <ProtectedRoute requireEmailVerification={true}>
      <div className="mx-auto max-w-5xl px-8 py-12">
        {/* Status */}
        {loading ? <ApplicationStatusSkeleton /> : noRegistration ? <ApplicationInProgress /> : <ApplicationSubmitted />}

        {/* QR Code Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Your QR Code
          </h2>
          <p className="mb-8 text-gray-500">
            Save this QR code to your phone. You&apos;ll need it to check in at the
            event and access meals and activities.
          </p>

          <div className="flex flex-col items-center">
            {loading ? (
              <div className="flex h-75 w-75 items-center justify-center rounded-xl bg-gray-50">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-4 text-center text-red-800">
                {error}
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm">
                  <Image
                    src={qrCodeUrl}
                    alt="Your PickHacks QR Code"
                    width={300}
                    height={300}
                    className="h-75 w-75"
                    unoptimized
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => window.print()}
                    className="rounded-lg bg-[#44ab48] px-6 py-3 font-medium text-white shadow-sm transition hover:bg-[#3a9c3e] hover:shadow"
                  >
                    Print QR Code
                  </button>
                  <a
                    href={qrCodeUrl}
                    download="pickhacks-qr-code.png"
                    className="rounded-lg border-2 border-[#44ab48] px-6 py-3 font-medium text-[#44ab48] transition hover:bg-[#e8f4e5]"
                  >
                    Download QR Code
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Event Details
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Event</dt>
              <dd className="text-base text-gray-900">PickHacks 2026</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Dates</dt>
              <dd className="text-base text-gray-900">2/27 - 3/1</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="text-base text-gray-900">
                Missouri University of Science and Technology
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Questions?</dt>
              <dd className="text-base text-gray-900">
                Reach out to us at{" "}
                <a
                  href="mailto:hello@pickhacks.io"
                  className="text-[#44ab48] hover:underline"
                >
                  hello@pickhacks.io
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </ProtectedRoute>
  );
}
