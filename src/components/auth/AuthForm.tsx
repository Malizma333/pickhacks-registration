"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/Button";
import { Divider } from "~/components/ui/Divider";
import { FormInput } from "~/components/ui/FormInput";

type AuthMode = "signin" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signin");

  const isSignIn = mode === "signin";
  const submitButtonText = isSignIn ? "Sign In" : "Create Account";
  const toggleText = isSignIn
    ? "Create an account"
    : "Already have an account? Sign in";
  const toggleMode = () => setMode(isSignIn ? "signup" : "signin");

  return (
    <form className="space-y-4">
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

      <div>
        <Button type="submit" variant="primary" fullWidth>
          {submitButtonText}
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
