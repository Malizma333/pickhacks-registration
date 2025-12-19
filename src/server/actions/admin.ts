"use server";

import { db } from "~/server/db";
import { event as eventTable, eventRegistration } from "~/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "~/server/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

async function verifyAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Not authenticated" };
  }

  const user = await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.id, session.user.id),
  });

  if (!user?.isAdmin) {
    return { error: "Unauthorized - Admin access required" };
  }

  return { session, user };
}

export async function checkIsAdmin() {
  try {
    const result = await verifyAdmin();
    return { isAdmin: !result.error };
  } catch (error) {
    console.error("Check admin error:", error);
    return { isAdmin: false };
  }
}

interface CreateEventData {
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
}

export async function canCreateEvent() {
  try {
    const activeEvent = await db.query.event.findFirst({
      where: eq(eventTable.isActive, true),
    });

    if (!activeEvent) {
      return { canCreate: true, reason: null };
    }

    const now = new Date();
    const endDate = new Date(activeEvent.endDate);

    if (now > endDate) {
      return { canCreate: true, reason: "previous_event_ended" };
    }

    return {
      canCreate: false,
      reason: "active_event_exists",
      activeEvent,
    };
  } catch (error) {
    console.error("Can create event error:", error);
    return { canCreate: false, reason: "error" };
  }
}

export async function createEvent(data: CreateEventData) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) {
      return authResult;
    }

    const canCreate = await canCreateEvent();
    if (!canCreate.canCreate) {
      return { error: "Cannot create event while an active event exists" };
    }

    await db.update(eventTable).set({ isActive: false });

    const [newEvent] = await db
      .insert(eventTable)
      .values({
        id: nanoid(),
        name: data.name,
        year: data.year,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        registrationOpensAt: data.registrationOpensAt
          ? new Date(data.registrationOpensAt)
          : null,
        registrationClosesAt: data.registrationClosesAt
          ? new Date(data.registrationClosesAt)
          : null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return { success: true, event: newEvent };
  } catch (error) {
    console.error("Create event error:", error);
    return { error: "Failed to create event" };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) {
      return authResult;
    }

    const registrations = await db.query.eventRegistration.findMany({
      where: eq(eventRegistration.eventId, eventId),
    });

    if (registrations.length > 0) {
      return {
        error: `Cannot delete event with ${registrations.length} registration(s). Remove registrations first.`,
      };
    }

    await db.delete(eventTable).where(eq(eventTable.id, eventId));

    return { success: true };
  } catch (error) {
    console.error("Delete event error:", error);
    return { error: "Failed to delete event" };
  }
}

export async function fetchActiveEvent() {
  try {
    const activeEvent = await db.query.event.findFirst({
      where: eq(eventTable.isActive, true),
    });

    return activeEvent ?? null;
  } catch (error) {
    console.error("Fetch active event error:", error);
    return null;
  }
}

export async function fetchAllEvents() {
  try {
    const events = await db.query.event.findMany({
      orderBy: [desc(eventTable.year)],
    });

    return events;
  } catch (error) {
    console.error("Fetch all events error:", error);
    return [];
  }
}

export async function fetchEventRegistrations(eventId?: string) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) {
      return authResult;
    }

    let targetEventId = eventId;
    if (!targetEventId) {
      const activeEvent = await db.query.event.findFirst({
        where: eq(eventTable.isActive, true),
      });

      if (!activeEvent) {
        return { error: "No active event found" };
      }

      targetEventId = activeEvent.id;
    }

    const registrations = await db.query.eventRegistration.findMany({
      where: eq(eventRegistration.eventId, targetEventId),
      with: {
        hackerProfile: true,
        education: { with: { school: true } },
        shipping: true,
        mlhAgreement: true,
        dietaryRestrictions: { with: { dietaryRestriction: true } },
      },
      orderBy: [desc(eventRegistration.createdAt)],
    });

    return { success: true, registrations };
  } catch (error) {
    console.error("Get event registrations error:", error);
    return { error: "Failed to fetch registrations" };
  }
}

export async function fetchRegistrationStats(eventId?: string) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) {
      return authResult;
    }

    let targetEventId = eventId;
    if (!targetEventId) {
      const activeEvent = await db.query.event.findFirst({
        where: eq(eventTable.isActive, true),
      });

      if (!activeEvent) {
        return { error: "No active event found" };
      }

      targetEventId = activeEvent.id;
    }

    const registrations = await db.query.eventRegistration.findMany({
      where: and(
        eq(eventRegistration.eventId, targetEventId),
        eq(eventRegistration.isComplete, true)
      ),
    });

    return {
      success: true,
      stats: {
        totalRegistrations: registrations.length,
        completeRegistrations: registrations.filter((r) => r.isComplete).length,
      },
    };
  } catch (error) {
    console.error("Get registration stats error:", error);
    return { error: "Failed to fetch stats" };
  }
}
