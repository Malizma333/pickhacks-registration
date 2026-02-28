"use client";

import type { Education, Shipping, Demographics } from "~/types/admin";

interface HackerInfoCardProps {
  hacker: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    linkedinUrl?: string | null;
  };
  ageAtEvent?: number;
  education?: Education;
  shipping?: Shipping;
  demographics?: Demographics;
  dietaryRestrictions: {
    name: string;
    allergyDetails: string | null;
  }[];
  isComplete?: boolean;
  showDietaryProminent?: boolean;
  resumeUrl?: string | null;
  resumeFileName?: string | null;
}

export function HackerInfoCard({
  hacker,
  ageAtEvent,
  education,
  shipping,
  demographics,
  dietaryRestrictions,
  isComplete = true,
  showDietaryProminent = false,
  resumeUrl,
  resumeFileName,
}: HackerInfoCardProps) {
  const hasDietary = dietaryRestrictions.length > 0;
  const hasAllergyDetails = dietaryRestrictions.some((d) => d.allergyDetails);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header with name */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {hacker.firstName} {hacker.lastName}
            </h3>
            <p className="text-sm text-gray-500">{hacker.phoneNumber}</p>
          </div>
          {isComplete ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Registered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
              Incomplete
            </span>
          )}
        </div>
      </div>

      {/* Full Details */}
      <div className="px-6 py-4 border-b border-gray-200">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {ageAtEvent != null && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Age
              </dt>
              <dd className="mt-0.5 text-gray-900">{ageAtEvent}</dd>
            </div>
          )}
          {hacker.linkedinUrl && (
            <div className="col-span-2">
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                LinkedIn
              </dt>
              <dd className="mt-0.5">
                <a
                  href={hacker.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {hacker.linkedinUrl}
                </a>
              </dd>
            </div>
          )}
          {education?.school?.name && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                School
              </dt>
              <dd className="mt-0.5 text-gray-900">
                {education.school.name}
              </dd>
            </div>
          )}
          {education?.levelOfStudy && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Level of Study
              </dt>
              <dd className="mt-0.5 text-gray-900">
                {education.levelOfStudy}
              </dd>
            </div>
          )}
          {education?.major && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Major
              </dt>
              <dd className="mt-0.5 text-gray-900">{education.major}</dd>
            </div>
          )}
          {education?.graduationYear && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Expected Graduation
              </dt>
              <dd className="mt-0.5 text-gray-900">
                {education.graduationYear}
              </dd>
            </div>
          )}
          {shipping?.tshirtSize && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                T-Shirt Size
              </dt>
              <dd className="mt-0.5 text-gray-900">
                {shipping.tshirtSize}
              </dd>
            </div>
          )}
          {demographics?.countryOfResidence && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Country
              </dt>
              <dd className="mt-0.5 text-gray-900">
                {demographics.countryOfResidence}
              </dd>
            </div>
          )}
          {shipping?.addressLine1 && (
            <div className="col-span-2">
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Shipping Address
              </dt>
              <dd className="mt-0.5 text-gray-900">
                {shipping.addressLine1}
                {shipping.addressLine2 && `, ${shipping.addressLine2}`}
                <br />
                {shipping.city}, {shipping.state} {shipping.postalCode}
                {shipping.country && `, ${shipping.country}`}
              </dd>
            </div>
          )}
          {resumeUrl && (
            <div className="col-span-2">
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Resume
              </dt>
              <dd className="mt-0.5">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {resumeFileName ?? "View Resume"}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Dietary Restrictions - Prominent when at food station */}
      {showDietaryProminent && (
        <div
          className={`px-6 py-4 ${hasDietary
            ? "bg-amber-50 border-b-2 border-amber-200"
            : "bg-green-50 border-b border-green-200"
            }`}
        >
          <div className="flex items-start gap-3">
            {hasDietary ? (
              <>
                <svg
                  className="w-6 h-6 text-amber-500 shrink-0 mt-0.5"
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
                <div>
                  <h4 className="font-semibold text-amber-800">
                    Dietary Restrictions
                  </h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {dietaryRestrictions.map((dr, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 text-sm font-medium text-amber-800 bg-amber-100 rounded"
                      >
                        {dr.name}
                      </span>
                    ))}
                  </div>
                  {hasAllergyDetails && (
                    <div className="mt-2 text-sm text-amber-700">
                      <strong>Allergy Details:</strong>{" "}
                      {dietaryRestrictions
                        .filter((d) => d.allergyDetails)
                        .map((d) => d.allergyDetails)
                        .join(", ")}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 text-green-500 shrink-0 mt-0.5"
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
                <div>
                  <h4 className="font-semibold text-green-800">
                    No Dietary Restrictions
                  </h4>
                  <p className="text-sm text-green-700">
                    This hacker has no dietary restrictions or allergies.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dietary Restrictions - Compact when not at food station */}
      {!showDietaryProminent && hasDietary && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Dietary:</span>
            <div className="flex flex-wrap gap-1">
              {dietaryRestrictions.map((dr, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded"
                >
                  {dr.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
