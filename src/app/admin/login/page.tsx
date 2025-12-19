"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "~/lib/auth-client";
import { Button } from "~/components/ui/Button";
import { Divider } from "~/components/ui/Divider";
import { FormInput } from "~/components/ui/FormInput";
import { checkIsAdmin } from "~/server/actions/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in and is admin
  useEffect(() => {
    async function checkAdmin() {
      const result = await checkIsAdmin();
      if (result.isAdmin) {
        router.push("/admin");
      }
    }
    void checkAdmin();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "An error occurred during sign in");
        setLoading(false);
      } else {
        // Check if user is admin
        const adminCheck = await checkIsAdmin();
        if (adminCheck.isAdmin) {
          router.push("/admin");
        } else {
          setError("Access denied. Admin privileges required.");
          setLoading(false);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f4e5] via-white to-[#e8f0f8] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Admin Login
          </h1>
          <p className="text-gray-600">
            Sign in to access the PickHacks admin panel
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <FormInput type="email" name="email" placeholder="Admin Email" />
            </div>

            <div>
              <FormInput
                type="password"
                name="password"
                placeholder="Password"
                bgColor="bg-[#e8f0f8]"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? "Signing in..." : "Sign In as Admin"}
              </Button>
            </div>

            <Divider text="or" bgColor="bg-[#e8f4e5]" />

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
              >
                Back to regular login
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-semibold">Admin Access Only</p>
          <p className="mt-1">
            Only users with admin privileges can access the admin panel. Contact
            your system administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
