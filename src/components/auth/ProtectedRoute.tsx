"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "~/lib/auth-client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({
  children,
  requireEmailVerification = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (requireEmailVerification && session && !session.user.emailVerified) {
      router.replace("/verify-email");
      return;
    }

    setIsReady(true);
  }, [session, isPending, router, requireEmailVerification]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#44ab48] border-r-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
