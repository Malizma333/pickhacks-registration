"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "~/lib/auth-client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({ children, requireEmailVerification = true }: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isPending) {
      return;
    }

    // Not logged in
    if (!session) {
      router.push("/login");
      return;
    }

    // Email verification required but not verified
    if (requireEmailVerification && !session.user.emailVerified) {
      // Show a message or redirect to a "verify email" page
      router.push("/verify-email");
      return;
    }

    setChecking(false);
  }, [session, isPending, router, requireEmailVerification]);

  if (isPending || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#44ab48] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
