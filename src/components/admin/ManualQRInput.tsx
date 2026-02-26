"use client";

import { useState } from "react";
import { FormInput } from "~/components/ui/FormInput";
import { Button } from "~/components/ui/Button";

interface ManualQRInputProps {
  onSubmit: (qrCode: string) => void;
  isLoading?: boolean;
}

export function ManualQRInput({ onSubmit, isLoading = false }: ManualQRInputProps) {
  const [qrCode, setQrCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;
    onSubmit(qrCode.trim());
    setQrCode("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1">
        <FormInput
          type="text"
          name="qrCode"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          placeholder="Enter QR code manually..."
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        disabled={isLoading || !qrCode.trim()}
        className="px-6"
      >
        {isLoading ? "..." : "Lookup"}
      </Button>
    </form>
  );
}
