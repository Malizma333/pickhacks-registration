"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/Button";
import { Divider } from "~/components/ui/Divider";
import { FormInput } from "~/components/ui/FormInput";
import { Logo } from "~/components/ui/Logo";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is invalid or expired.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await authClient.resetPassword({
      token,
      newPassword: password,
    });

    setLoading(false);

    if (error) {
      setError(error.message ?? "An error occurred requesting password reset");
    } else {
      setSuccess("Your password has been reset successfully.");
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
              Reset your password
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Enter a new password for your account.
            </p>
          </div>

          {!token && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              This reset link is invalid or expired.
            </div>
          )}

          {!success && token && (
            <>
              <div>
                <FormInput
                  type="password"
                  name="password"
                  placeholder="New password"
                  bgColor="bg-[#e8f0f8]"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <FormInput
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  bgColor="bg-[#e8f0f8]"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

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

          {!success && token && (
            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset password"}
              </Button>
            </div>
          )}

          {success && (
            <>
              <Divider text="or" bgColor="bg-[#e8f4e5]" />
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-[#074c72] hover:text-[#053a54] hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
