"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";

export default function DashboardPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual QR code from database
    // For now, generate a placeholder QR code using a free API
    const generateQRCode = async () => {
      try {
        // This is a placeholder - we'll replace with actual QR code from DB
        const mockData = "PICKHACKS2025-USER-12345";
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockData)}`;
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      } finally {
        setLoading(false);
      }
    };

    generateQRCode();
  }, []);

  return (
    <ProtectedRoute requireEmailVerification={true}>
      <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Success Message */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 bg-[#44ab48] rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
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
              Application Submitted
            </h1>
            <p className="text-gray-600 mt-1">
              Thank you for registering for PickHacks 2025! We'll email you with
              updates and event details.
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your QR Code</h2>
        <p className="text-gray-500 mb-8">
          Save this QR code to your phone. You'll need it to check in at the event
          and access meals and activities.
        </p>

        <div className="flex flex-col items-center">
          {loading ? (
            <div className="w-[300px] h-[300px] bg-gray-50 rounded-xl flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 mb-6 shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="Your PickHacks QR Code"
                  className="w-[300px] h-[300px]"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-[#44ab48] text-white rounded-lg hover:bg-[#3a9c3e] transition font-medium shadow-sm hover:shadow"
                >
                  Print QR Code
                </button>
                <a
                  href={qrCodeUrl}
                  download="pickhacks-qr-code.png"
                  className="px-6 py-3 border-2 border-[#44ab48] text-[#44ab48] rounded-lg hover:bg-[#e8f4e5] transition font-medium"
                >
                  Download QR Code
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Event Details</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Event</dt>
            <dd className="text-base text-gray-900">PickHacks 2025</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Date</dt>
            <dd className="text-base text-gray-900">TBD</dd>
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
