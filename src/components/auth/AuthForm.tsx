"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "~/lib/auth-client";
import { Button } from "~/components/ui/Button";
import { Divider } from "~/components/ui/Divider";
import { FormInput } from "~/components/ui/FormInput";

type AuthMode = "signin" | "signup";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSignIn = mode === "signin";
  const submitButtonText = isSignIn ? "Sign In" : "Create Account";
  const toggleText = isSignIn
    ? "Create an account"
    : "Already have an account? Sign in";
  const toggleMode = () => {
    setMode(isSignIn ? "signup" : "signin");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // Validate confirm password for sign up
    if (!isSignIn) {
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignIn) {
        const result = await signIn.email({
          email,
          password,
        });

        if (result.error) {
          setError(result.error.message ?? "An error occurred during sign in");
        } else {
          router.push("/");
        }
      } else {
        const result = await signUp.email({
          email,
          password,
          name,
        });

        if (result.error) {
          setError(result.error.message ?? "An error occurred during sign up");
        } else {
          setSuccess("Please check your email to verify your account");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!isSignIn && (
        <div>
          <FormInput type="text" name="name" placeholder="Full Name" />
        </div>
      )}

      <div>
        <FormInput type="email" name="email" placeholder="Email" />
      </div>

      <div>
        <FormInput
          type="password"
          name="password"
          placeholder="Password"
          bgColor="bg-[#e8f0f8]"
        />
      </div>

      {!isSignIn && (
        <div>
          <FormInput
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            bgColor="bg-[#e8f0f8]"
          />
        </div>
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

      <div>
        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Loading..." : submitButtonText}
        </Button>
      </div>

      <Divider text="or" bgColor="bg-[#e8f4e5]" />

      <div className="text-center">
        <button
          type="button"
          onClick={toggleMode}
          className="text-[#074c72] hover:text-[#053a54] hover:underline"
        >
          {toggleText}
        </button>
      </div>

      {isSignIn && (
        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      )}
    </form>
  );
}
