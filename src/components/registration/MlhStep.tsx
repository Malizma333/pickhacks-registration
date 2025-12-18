"use client";

import { Checkbox } from "~/components/ui/Checkbox";
import type { MlhFormData } from "~/utils/form-validation";

interface MlhStepProps {
  data: Partial<MlhFormData>;
  onChange: (data: Partial<MlhFormData>) => void;
}

export function MlhStep({ data, onChange }: MlhStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          MLH Agreements
        </h2>
        <p className="text-gray-600">
          Please review and accept the following agreements to complete your
          registration.
        </p>
      </div>

      <div className="space-y-5 bg-[#e8f4e5] p-8 rounded-xl border border-[#44ab48]/20">
        <Checkbox
          name="agreedToCodeOfConduct"
          checked={data.agreedToCodeOfConduct ?? false}
          onChange={(checked) =>
            onChange({ ...data, agreedToCodeOfConduct: checked })
          }
          required
          label={
            <span>
              I have read and agree to the{" "}
              <a
                href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#074c72] underline hover:text-[#44ab48]"
              >
                MLH Code of Conduct
              </a>
              . *
            </span>
          }
        />

        <Checkbox
          name="agreedToMlhSharing"
          checked={data.agreedToMlhSharing ?? false}
          onChange={(checked) =>
            onChange({ ...data, agreedToMlhSharing: checked })
          }
          required
          label={
            <span>
              I authorize you to share my application/registration information
              with Major League Hacking for event administration, ranking, and
              MLH administration in-line with the{" "}
              <a
                href="https://mlh.io/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#074c72] underline hover:text-[#44ab48]"
              >
                MLH Privacy Policy
              </a>
              . I further agree to the terms of both the{" "}
              <a
                href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#074c72] underline hover:text-[#44ab48]"
              >
                MLH Contest Terms and Conditions
              </a>{" "}
              and the{" "}
              <a
                href="https://mlh.io/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#074c72] underline hover:text-[#44ab48]"
              >
                MLH Privacy Policy
              </a>
              . *
            </span>
          }
        />

        <Checkbox
          name="agreedToMlhEmails"
          checked={data.agreedToMlhEmails ?? false}
          onChange={(checked) =>
            onChange({ ...data, agreedToMlhEmails: checked })
          }
          label={
            <span>
              I authorize MLH to send me occasional emails about relevant
              events, career opportunities, and community announcements.
            </span>
          }
        />
      </div>

      <p className="text-sm text-gray-500">
        * Required fields
      </p>
    </div>
  );
}
