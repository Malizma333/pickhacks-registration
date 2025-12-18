"use client";

import { FormInput } from "~/components/ui/FormInput";
import type { ProfileFormData } from "~/utils/form-validation";

interface ProfileStepProps {
  data: Partial<ProfileFormData>;
  onChange: (data: Partial<ProfileFormData>) => void;
}

export function ProfileStep({ data, onChange }: ProfileStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          Personal Information
        </h2>
        <p className="text-gray-600">
          Let's start with some basic information about you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            First Name *
          </label>
          <FormInput
            type="text"
            name="firstName"
            value={data.firstName ?? ""}
            onChange={(e) =>
              onChange({ ...data, firstName: e.target.value })
            }
            placeholder="John"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Last Name *
          </label>
          <FormInput
            type="text"
            name="lastName"
            value={data.lastName ?? ""}
            onChange={(e) =>
              onChange({ ...data, lastName: e.target.value })
            }
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone Number *
        </label>
        <FormInput
          type="tel"
          name="phoneNumber"
          value={data.phoneNumber ?? ""}
          onChange={(e) =>
            onChange({ ...data, phoneNumber: e.target.value })
          }
          placeholder="+1 (555) 123-4567"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Age *
        </label>
        <FormInput
          type="number"
          name="ageAtEvent"
          value={data.ageAtEvent?.toString() ?? ""}
          onChange={(e) =>
            onChange({ ...data, ageAtEvent: parseInt(e.target.value) || 0 })
          }
          placeholder="18"
          required
          min={13}
          max={120}
        />
        <p className="mt-2 text-sm text-gray-500">
          You must be at least 13 years old to participate.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          LinkedIn Profile (Optional)
        </label>
        <FormInput
          type="url"
          name="linkedinUrl"
          value={data.linkedinUrl ?? ""}
          onChange={(e) =>
            onChange({ ...data, linkedinUrl: e.target.value })
          }
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>
    </div>
  );
}
