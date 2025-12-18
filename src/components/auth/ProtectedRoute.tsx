"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "~/lib/auth-client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({ children, requireEmailVerification = true }: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    // Additional check for email verification
    if (requireEmailVerification && session && !session.user.emailVerified) {
      router.replace("/verify-email");
    }
  }, [session, isPending, router, requireEmailVerification]);

  // Minimal loading - middleware already handled auth check
  if (isPending) {
    return null; // Don't show spinner since middleware already checked
  }

  // Email verification check
  if (requireEmailVerification && session && !session.user.emailVerified) {
    return null;
  }

  return <>{children}</>;
}
