"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/Button";
import { Divider } from "~/components/ui/Divider";
import { FormInput } from "~/components/ui/FormInput";
import { Logo } from "~/components/ui/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.requestPasswordReset({ email });

    setLoading(false);

    if (error) {
      setError(error.message ?? "An error occurred requesting password reset");
    } else {
      setSuccess(
        "If an account exists for this email, a reset link has been sent."
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8f4e5] p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-64">
            <Logo variant="text" width={256} />
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Forgot your password?
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Enter your email and we’ll send you a reset link.
            </p>
          </div>

          <div>
            <FormInput
              type="email"
              name="email"
              placeholder="Email"
              disabled={!!success}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              {success}
            </div>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </div>

          <Divider text="or" bgColor="bg-[#e8f4e5]" />

          <div className="text-center">
            <Link
              href="/login"
              className="text-[#074c72] hover:text-[#053a54] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
