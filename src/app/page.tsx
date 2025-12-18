"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { ProfileStep } from "~/components/registration/ProfileStep";
import { EducationStep } from "~/components/registration/EducationStep";
import { ShippingStep } from "~/components/registration/ShippingStep";
import { MlhStep } from "~/components/registration/MlhStep";
import { Button } from "~/components/ui/Button";
import type {
  ProfileFormData,
  EducationFormData,
  ShippingFormData,
  MlhFormData,
} from "~/utils/form-validation";

// TODO: Replace with actual data from database
const MOCK_SCHOOLS = [
  { id: "1", name: "Missouri University of Science and Technology" },
  { id: "2", name: "University of Missouri" },
  { id: "3", name: "Washington University in St. Louis" },
  { id: "4", name: "Saint Louis University" },
  { id: "5", name: "Other" },
];

const MOCK_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "GB", name: "United Kingdom" },
  { code: "IN", name: "India" },
];

export default function RegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<Partial<ProfileFormData>>({});
  const [educationData, setEducationData] = useState<Partial<EducationFormData>>({});
  const [shippingData, setShippingData] = useState<Partial<ShippingFormData>>({});
  const [mlhData, setMlhData] = useState<Partial<MlhFormData>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual form submission
      console.log("Submitting registration:", {
        profileData,
        educationData,
        shippingData,
        mlhData,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to success page or dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred while submitting your registration");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireEmailVerification={true}>
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Registration
          </h1>
          <p className="text-lg text-gray-600">
            Complete your registration for PickHacks 2025
          </p>
        </div>

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 hover:shadow-md transition-shadow">
            <ProfileStep data={profileData} onChange={setProfileData} />
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 hover:shadow-md transition-shadow">
            <EducationStep
              data={educationData}
              onChange={setEducationData}
              schools={MOCK_SCHOOLS}
            />
          </div>

          {/* Shipping Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 hover:shadow-md transition-shadow">
            <ShippingStep
              data={shippingData}
              onChange={setShippingData}
              countries={MOCK_COUNTRIES}
            />
          </div>

          {/* MLH Agreement Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 hover:shadow-md transition-shadow">
            <MlhStep data={mlhData} onChange={setMlhData} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button type="submit" variant="primary" disabled={loading} className="px-20 py-4 text-lg font-semibold shadow-lg hover:shadow-xl">
              {loading ? "Submitting..." : "Submit Registration"}
            </Button>
          </div>
        </div>
      </form>
    </ProtectedRoute>
  );
}
