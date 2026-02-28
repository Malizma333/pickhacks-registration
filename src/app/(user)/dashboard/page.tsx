"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { getRegistrationStatus } from "~/server/actions/registration";
import { UploadButton, UploadDropzone } from "~/lib/uploadthing";

function ApplicationInProgress() {
  return (
    <div className="mb-6 rounded-xl border border-yellow-400 bg-yellow-50 p-4 md:p-8 shadow-sm">
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
            Your registration for PickHacks 2026 is incomplete.
            No spot is reserved until you submit your registration.
          </p>
        </div>
      </div>
    </div>
  );
}

function ApplicationStatusSkeleton() {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 md:p-8 shadow-sm">
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
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const status = await getRegistrationStatus();
        if (status.registered && status.qrCode) {
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(status.qrCode)}`;
          setQrCodeUrl(qrUrl);
          setResumeUrl(status.resumeUrl ?? null);
          setResumeFileName(status.resumeFileName ?? null);
        } else {
          setNoRegistration(true);
          setError("No registration found.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  return (
    <ProtectedRoute requireEmailVerification={true}>
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-12">
        {/* Status */}
        {loading ? <ApplicationStatusSkeleton /> : noRegistration ? <ApplicationInProgress /> : null}

        {/* Resume Upload Section */}
        {!loading && !noRegistration && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 md:p-8 shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Your Resume
            </h2>
            <p className="mb-6 text-gray-500">
              Upload your resume so sponsors and recruiters can find you.
              PDF format only, up to 4MB.
            </p>

            {resumeUrl ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{resumeFileName}</p>
                    <p className="text-sm text-green-600">Uploaded successfully</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border-2 border-[#44ab48] px-4 py-2 text-sm font-medium text-[#44ab48] transition hover:bg-[#e8f4e5]"
                  >
                    View Resume
                  </a>
                  <UploadButton
                    endpoint="resumeUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]) {
                        setResumeUrl(res[0].ufsUrl);
                        setResumeFileName(res[0].name);
                      }
                    }}
                    onUploadError={(error) => {
                      console.error("Upload error:", error);
                    }}
                    appearance={{
                      button: "bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition ut-uploading:bg-gray-300",
                      allowedContent: "hidden",
                    }}
                    content={{
                      button: "Replace",
                    }}
                  />
                </div>
              </div>
            ) : (
              <UploadDropzone
                endpoint="resumeUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) {
                    setResumeUrl(res[0].ufsUrl);
                    setResumeFileName(res[0].name);
                  }
                }}
                onUploadError={(error) => {
                  console.error("Upload error:", error);
                }}
                appearance={{
                  container: "border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-[#44ab48] transition",
                  uploadIcon: "text-gray-400",
                  label: "text-gray-600",
                  allowedContent: "text-gray-400 text-sm",
                  button: "bg-[#44ab48] text-white font-medium px-6 py-2 rounded-lg hover:bg-[#3a9c3e] transition ut-uploading:bg-gray-400",
                }}
              />
            )}
          </div>
        )}

        {/* QR Code Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-8 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Your QR Code
          </h2>
          <p className="mb-8 text-gray-500">
            Save this QR code to your phone. You&apos;ll need it to check in at the
            event and access meals and activities.
          </p>

          <div className="flex flex-col items-center">
            {loading ? (
              <div className="flex h-48 w-48 md:h-75 md:w-75 items-center justify-center rounded-xl bg-gray-50">
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
                    className="h-48 w-48 md:h-75 md:w-75"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto rounded-lg bg-[#44ab48] px-6 py-3 font-medium text-white shadow-sm transition hover:bg-[#3a9c3e] hover:shadow"
                  >
                    Print QR Code
                  </button>
                  <a
                    href={qrCodeUrl}
                    download="pickhacks-qr-code.png"
                    className="w-full sm:w-auto text-center rounded-lg border-2 border-[#44ab48] px-6 py-3 font-medium text-[#44ab48] transition hover:bg-[#e8f4e5]"
                  >
                    Download QR Code
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 md:p-8 shadow-sm">
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
                  href="mailto:pickhacks@mst.edu"
                  className="text-[#44ab48] hover:underline"
                >
                  pickhacks@mst.edu
                </a>
                {" "}or join our{" "}
                <a
                  target="_blank"
                  href="https://discord.gg/QpTFVRNFkD"
                  className="text-[#44ab48] hover:underline"
                >discord server</a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </ProtectedRoute>
  );
}
