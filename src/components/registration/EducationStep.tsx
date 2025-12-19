"use client";

import { FormInput } from "~/components/ui/FormInput";
import { Select } from "~/components/ui/Select";
import { LEVEL_OF_STUDY_OPTIONS } from "~/utils/form-options";
import type { EducationFormData } from "~/utils/form-validation";

interface EducationStepProps {
  data: Partial<EducationFormData>;
  onChange: (data: Partial<EducationFormData>) => void;
  schools: Array<{ id: string; name: string }>;
  disabled?: boolean;
}

export function EducationStep({ data, onChange, schools, disabled = false }: EducationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Education</h2>
        <p className="text-gray-600">
          Tell us about your educational background.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          School *
        </label>
        <Select
          name="schoolId"
          value={data.schoolId ?? ""}
          onChange={(value) => onChange({ ...data, schoolId: value })}
          options={schools.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="Select your school"
          required
          disabled={disabled}
          searchable
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Level of Study *
        </label>
        <Select
          name="levelOfStudy"
          value={data.levelOfStudy ?? ""}
          onChange={(value) => onChange({ ...data, levelOfStudy: value })}
          options={LEVEL_OF_STUDY_OPTIONS}
          placeholder="Select your level of study"
          required
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Major (Optional)
        </label>
        <FormInput
          type="text"
          name="major"
          value={data.major ?? ""}
          onChange={(e) => onChange({ ...data, major: e.target.value })}
          placeholder="Computer Science"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Expected Graduation Year (Optional)
        </label>
        <FormInput
          type="number"
          name="graduationYear"
          value={data.graduationYear?.toString() ?? ""}
          onChange={(e) =>
            onChange({
              ...data,
              graduationYear: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          placeholder="2025"
          min={2020}
          max={2035}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
