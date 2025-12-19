"use client";

import { Checkbox } from "~/components/ui/Checkbox";
import { FormInput } from "~/components/ui/FormInput";
import type { DietaryFormData } from "~/utils/form-validation";

interface DietaryRestriction {
  id: string;
  name: string;
}

interface DietaryStepProps {
  data: Partial<DietaryFormData>;
  onChange: (data: Partial<DietaryFormData>) => void;
  dietaryRestrictions: DietaryRestriction[];
  disabled?: boolean;
}

export function DietaryStep({
  data,
  onChange,
  dietaryRestrictions,
  disabled = false,
}: DietaryStepProps) {
  const selectedIds = data.dietaryRestrictionIds ?? [];

  const handleToggle = (id: string, checked: boolean) => {
    const newIds = checked
      ? [...selectedIds, id]
      : selectedIds.filter((existingId) => existingId !== id);
    onChange({ ...data, dietaryRestrictionIds: newIds });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          Dietary Restrictions
        </h2>
        <p className="text-gray-600">
          Let us know about any dietary restrictions so we can accommodate you during meals.
        </p>
      </div>

      <div className="space-y-3">
        {dietaryRestrictions.map((restriction) => (
          <Checkbox
            key={restriction.id}
            name={`dietary-${restriction.id}`}
            checked={selectedIds.includes(restriction.id)}
            onChange={(checked) => handleToggle(restriction.id, checked)}
            label={restriction.name}
            disabled={disabled}
          />
        ))}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Other Allergies or Restrictions (Optional)
        </label>
        <FormInput
          type="text"
          name="allergyDetails"
          value={data.allergyDetails ?? ""}
          onChange={(e) => onChange({ ...data, allergyDetails: e.target.value })}
          placeholder="Please specify any other dietary needs..."
          disabled={disabled}
        />
        <p className="mt-2 text-sm text-gray-500">
          Include any food allergies or specific dietary needs not listed above.
        </p>
      </div>
    </div>
  );
}
