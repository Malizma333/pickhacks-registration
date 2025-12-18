"use server";

import { redirect } from "next/navigation";
import { authClient } from "~/lib/auth-client";

export async function signUpAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  try {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (result.error) {
      return { error: result.error.message };
    }

    return { success: true, message: "Please check your email to verify your account" };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "An error occurred during sign up" };
  }
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      return { error: result.error.message };
    }

    // Redirect to home page after successful sign in
    redirect("/");
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: "An error occurred during sign in" };
  }
}
