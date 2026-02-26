"use client";

import { useState } from "react";
import { FormInput } from "~/components/ui/FormInput";
import { Select } from "~/components/ui/Select";
import { Button } from "~/components/ui/Button";
import { STATION_TYPES } from "~/constants";

interface CreateStationFormProps {
  onSubmit: (data: {
    name: string;
    stationType: string;
    maxVisitsPerHacker: number | null;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CreateStationForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CreateStationFormProps) {
  const [name, setName] = useState("");
  const [stationType, setStationType] = useState("");
  const [maxVisits, setMaxVisits] = useState<string>("1");
  const [unlimitedVisits, setUnlimitedVisits] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !stationType) return;

    onSubmit({
      name: name.trim(),
      stationType,
      maxVisitsPerHacker: unlimitedVisits ? null : parseInt(maxVisits) || 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Station Name *
        </label>
        <FormInput
          type="text"
          name="stationName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Breakfast, Check-in"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Station Type *
        </label>
        <Select
          name="stationType"
          value={stationType}
          onChange={setStationType}
          options={STATION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          placeholder="Select type"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max Visits Per Hacker
        </label>
        <div className="flex items-center gap-3 mb-2">
          <input
            type="checkbox"
            id="unlimitedVisits"
            checked={unlimitedVisits}
            onChange={(e) => setUnlimitedVisits(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#44ab48] focus:ring-[#44ab48]"
            disabled={isSubmitting}
          />
          <label htmlFor="unlimitedVisits" className="text-sm text-gray-600">
            Unlimited visits
          </label>
        </div>
        {!unlimitedVisits && (
          <FormInput
            type="number"
            name="maxVisits"
            value={maxVisits}
            onChange={(e) => setMaxVisits(e.target.value)}
            min={1}
            max={100}
            disabled={isSubmitting}
          />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !name.trim() || !stationType}
          className="flex-1"
        >
          {isSubmitting ? "Creating..." : "Create Station"}
        </Button>
      </div>
    </form>
  );
}
