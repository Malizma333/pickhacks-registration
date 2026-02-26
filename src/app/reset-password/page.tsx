"use client";

import { Suspense } from "react";
import ResetPasswordForm from "~/components/auth/ResetPasswordForm";

function ResetPasswordSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Loading…</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
