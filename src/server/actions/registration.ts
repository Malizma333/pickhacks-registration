"use server";

import { db } from "~/server/db";
import {
  hackerProfile,
  eventRegistration,
  eventRegistrationEducation,
  eventRegistrationShipping,
  eventRegistrationMlhAgreement,
  eventRegistrationDietaryRestrictions,
} from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "~/server/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { getActiveEvent } from "./shared";

interface RegistrationData {
  // Profile
  firstName: string;
  lastName: string;
  phoneNumber: string;
  ageAtEvent: number;
  linkedinUrl?: string;

  // Education
  schoolId: string;
  levelOfStudy: string;
  major?: string;
  graduationYear?: number;

  // Shipping
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  tshirtSize?: string;

  // MLH
  agreedToCodeOfConduct: boolean;
  agreedToMlhSharing: boolean;
  agreedToMlhEmails: boolean;

  // Dietary
  dietaryRestrictionIds?: string[];
  allergyDetails?: string;
}

export async function submitRegistration(data: RegistrationData) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Not authenticated" };
    }

    const userId = session.user.id;

    const activeEvent = await getActiveEvent();
    if (!activeEvent) {
      return { error: "No active event found" };
    }

    // Check if user already has a registration for this event
    const existingProfile = await db.query.hackerProfile.findFirst({
      where: eq(hackerProfile.userId, userId),
    });

    if (existingProfile) {
      const existingRegistration = await db.query.eventRegistration.findFirst({
        where: and(
          eq(eventRegistration.hackerProfileId, existingProfile.id),
          eq(eventRegistration.eventId, activeEvent.id)
        ),
      });

      if (existingRegistration?.isComplete) {
        return { error: "You have already registered for this event" };
      }
    }

    const profileId = existingProfile
      ? existingProfile.id
      : (
          await db
            .insert(hackerProfile)
            .values({
              id: nanoid(),
              userId,
              firstName: data.firstName,
              lastName: data.lastName,
              phoneNumber: data.phoneNumber,
              linkedinUrl: data.linkedinUrl,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning()
        )[0]!.id;

    if (existingProfile) {
      await db
        .update(hackerProfile)
        .set({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          linkedinUrl: data.linkedinUrl,
          updatedAt: new Date(),
        })
        .where(eq(hackerProfile.id, profileId));
    }

    const qrCode = `PICKHACKS2025-${nanoid(12)}`;

    const [registration] = await db
      .insert(eventRegistration)
      .values({
        id: nanoid(),
        eventId: activeEvent.id,
        hackerProfileId: profileId,
        ageAtEvent: data.ageAtEvent,
        qrCode,
        isComplete: true,
        lockedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const registrationId = registration!.id;

    await db.insert(eventRegistrationEducation).values({
      id: nanoid(),
      eventRegistrationId: registrationId,
      schoolId: data.schoolId,
      levelOfStudy: data.levelOfStudy,
      major: data.major,
      graduationYear: data.graduationYear,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(eventRegistrationShipping).values({
      id: nanoid(),
      eventRegistrationId: registrationId,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      tshirtSize: data.tshirtSize,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(eventRegistrationMlhAgreement).values({
      id: nanoid(),
      eventRegistrationId: registrationId,
      agreedToCodeOfConduct: data.agreedToCodeOfConduct,
      agreedToMlhSharing: data.agreedToMlhSharing,
      agreedToMlhEmails: data.agreedToMlhEmails,
      agreedAt: new Date(),
      updatedAt: new Date(),
    });

    // Insert dietary restrictions
    if (data.dietaryRestrictionIds && data.dietaryRestrictionIds.length > 0) {
      await db.insert(eventRegistrationDietaryRestrictions).values(
        data.dietaryRestrictionIds.map((restrictionId) => ({
          id: nanoid(),
          eventRegistrationId: registrationId,
          dietaryRestrictionId: restrictionId,
          allergyDetails: data.allergyDetails,
        }))
      );
    } else if (data.allergyDetails) {
      // If only allergy details are provided without selecting any restrictions
      await db.insert(eventRegistrationDietaryRestrictions).values({
        id: nanoid(),
        eventRegistrationId: registrationId,
        dietaryRestrictionId: "other",
        allergyDetails: data.allergyDetails,
      });
    }

    return { success: true, qrCode, registrationId };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to submit registration" };
  }
}

export async function getRegistrationStatus() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { registered: false };
    }

    const userId = session.user.id;

    const activeEvent = await getActiveEvent();
    if (!activeEvent) {
      return { registered: false };
    }

    // Check if user has a profile
    const profile = await db.query.hackerProfile.findFirst({
      where: eq(hackerProfile.userId, userId),
    });

    if (!profile) {
      return { registered: false };
    }

    // Check if user has a registration for this event
    const registration = await db.query.eventRegistration.findFirst({
      where: and(
        eq(eventRegistration.hackerProfileId, profile.id),
        eq(eventRegistration.eventId, activeEvent.id)
      ),
      with: {
        education: true,
        shipping: true,
        mlhAgreement: true,
        dietaryRestrictions: true,
      },
    });

    if (!registration?.isComplete) {
      return { registered: false };
    }

    return {
      registered: true,
      qrCode: registration.qrCode,
      registrationData: {
        profile: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber,
          linkedinUrl: profile.linkedinUrl,
          ageAtEvent: registration.ageAtEvent,
        },
        education: registration.education,
        shipping: registration.shipping,
        mlhAgreement: registration.mlhAgreement,
        dietaryRestrictions: registration.dietaryRestrictions,
      },
    };
  } catch (error) {
    console.error("Get registration status error:", error);
    return { registered: false };
  }
}
