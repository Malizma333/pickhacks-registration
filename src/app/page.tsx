"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { ProfileStep } from "~/components/registration/ProfileStep";
import { EducationStep } from "~/components/registration/EducationStep";
import { ShippingStep } from "~/components/registration/ShippingStep";
import { MlhStep } from "~/components/registration/MlhStep";
import { Button } from "~/components/ui/Button";
import { submitRegistration, getRegistrationStatus } from "~/server/actions/registration";
import { getSchools, getCountries, seedLookupData } from "~/server/actions/lookup";
import type {
  ProfileFormData,
  EducationFormData,
  ShippingFormData,
  MlhFormData,
} from "~/utils/form-validation";

export default function RegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);

  const [profileData, setProfileData] = useState<Partial<ProfileFormData>>({});
  const [educationData, setEducationData] = useState<Partial<EducationFormData>>({});
  const [shippingData, setShippingData] = useState<Partial<ShippingFormData>>({});
  const [mlhData, setMlhData] = useState<Partial<MlhFormData>>({});

  // Fetch lookup data and check registration status
  useEffect(() => {
    async function initialize() {
      // Seed lookup data if needed
      await seedLookupData();

      // Fetch schools and countries
      const [schoolsData, countriesData] = await Promise.all([
        getSchools(),
        getCountries(),
      ]);
      setSchools(schoolsData);
      setCountries(countriesData);

      // Check registration status
      const status = await getRegistrationStatus();
      if (status.registered && status.registrationData) {
        setIsRegistered(true);
        // Pre-fill form with existing data
        const { profile, education, shipping, mlhAgreement } = status.registrationData;
        setProfileData({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber,
          ageAtEvent: profile.ageAtEvent,
          linkedinUrl: profile.linkedinUrl || undefined,
        });
        setEducationData({
          schoolId: education?.schoolId || "",
          levelOfStudy: education?.levelOfStudy || "",
          major: education?.major || undefined,
          graduationYear: education?.graduationYear ?? undefined,
        });
        setShippingData({
          addressLine1: shipping?.addressLine1 || "",
          addressLine2: shipping?.addressLine2 || undefined,
          city: shipping?.city || "",
          state: shipping?.state || "",
          country: shipping?.country || "",
          postalCode: shipping?.postalCode || "",
          tshirtSize: shipping?.tshirtSize || undefined,
        });
        setMlhData({
          agreedToCodeOfConduct: mlhAgreement?.agreedToCodeOfConduct || false,
          agreedToMlhSharing: mlhAgreement?.agreedToMlhSharing || false,
          agreedToMlhEmails: mlhAgreement?.agreedToMlhEmails || false,
        });
      }
      setCheckingStatus(false);
    }
    void initialize();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await submitRegistration({
        // Profile
        firstName: profileData.firstName!,
        lastName: profileData.lastName!,
        phoneNumber: profileData.phoneNumber!,
        ageAtEvent: profileData.ageAtEvent!,
        linkedinUrl: profileData.linkedinUrl,
        // Education
        schoolId: educationData.schoolId!,
        levelOfStudy: educationData.levelOfStudy!,
        major: educationData.major,
        graduationYear: educationData.graduationYear ?? undefined,
        // Shipping
        addressLine1: shippingData.addressLine1!,
        addressLine2: shippingData.addressLine2,
        city: shippingData.city!,
        state: shippingData.state!,
        country: shippingData.country!,
        postalCode: shippingData.postalCode!,
        tshirtSize: shippingData.tshirtSize,
        // MLH
        agreedToCodeOfConduct: mlhData.agreedToCodeOfConduct!,
        agreedToMlhSharing: mlhData.agreedToMlhSharing!,
        agreedToMlhEmails: mlhData.agreedToMlhEmails || false,
      });

      if (result.error) {
        setError(result.error);
      } else {
        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred while submitting your registration");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <ProtectedRoute requireEmailVerification={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#44ab48] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireEmailVerification={true}>
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Registration
          </h1>
          <p className="text-lg text-gray-600">
            {isRegistered ? "Your registration for PickHacks 2025" : "Complete your registration for PickHacks 2025"}
          </p>
          {isRegistered && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#e8f4e5] px-4 py-2 text-sm font-medium text-[#44ab48]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Registration Complete
            </div>
          )}
        </div>

        {/* Form Sections - Grayed out if registered */}
        <div className={`space-y-8 ${isRegistered ? "opacity-60 pointer-events-none" : ""}`}>
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 hover:shadow-md transition-shadow">
            <ProfileStep data={profileData} onChange={setProfileData} disabled={isRegistered} />
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 hover:shadow-md transition-shadow">
            <EducationStep
              data={educationData}
              onChange={setEducationData}
              schools={schools}
              disabled={isRegistered}
            />
          </div>

          {/* Shipping Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 hover:shadow-md transition-shadow">
            <ShippingStep
              data={shippingData}
              onChange={setShippingData}
              countries={countries}
              disabled={isRegistered}
            />
          </div>

          {/* MLH Agreement Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 hover:shadow-md transition-shadow">
            <MlhStep data={mlhData} onChange={setMlhData} disabled={isRegistered} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Submit Button - Hidden if registered */}
          {!isRegistered && (
            <div className="flex justify-center pt-6">
              <Button type="submit" variant="primary" disabled={loading} className="px-20 py-4 text-lg font-semibold shadow-lg hover:shadow-xl">
                {loading ? "Submitting..." : "Submit Registration"}
              </Button>
            </div>
          )}
        </div>
      </form>
    </ProtectedRoute>
  );
}
