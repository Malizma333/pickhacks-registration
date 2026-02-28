"use server";

import { db } from "~/server/db";
import { hackerProfile, eventRegistration } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getActiveEvent } from "./shared";

export async function saveResumeToRegistration(data: {
  userId: string;
  resumeUrl: string;
  resumeFileName: string;
}) {
  try {
    const activeEvent = await getActiveEvent();
    if (!activeEvent) {
      return { error: "No active event found" };
    }

    const profile = await db.query.hackerProfile.findFirst({
      where: eq(hackerProfile.userId, data.userId),
    });

    if (!profile) {
      return { error: "No hacker profile found" };
    }

    const registration = await db.query.eventRegistration.findFirst({
      where: and(
        eq(eventRegistration.hackerProfileId, profile.id),
        eq(eventRegistration.eventId, activeEvent.id),
      ),
    });

    if (!registration) {
      return { error: "No registration found for this event" };
    }

    await db
      .update(eventRegistration)
      .set({
        resumeUrl: data.resumeUrl,
        resumeFileName: data.resumeFileName,
      })
      .where(eq(eventRegistration.id, registration.id));

    return { success: true };
  } catch (error) {
    console.error("Save resume error:", error);
    return { error: "Failed to save resume" };
  }
}
