"use server";

import { db } from "~/server/db";
import { eventStation, checkIn, eventRegistration } from "~/server/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { DEFAULT_STATIONS } from "~/constants";
import { verifyAdmin, verifyAdminWithActiveEvent } from "./shared";

// ============ STATION ACTIONS ============

export async function fetchEventStations() {
  try {
    const result = await verifyAdminWithActiveEvent();
    if (result.error) {
      return { error: result.error };
    }

    const stations = await db.query.eventStation.findMany({
      where: eq(eventStation.eventId, result.activeEvent!.id),
      orderBy: [desc(eventStation.createdAt)],
    });

    return { stations };
  } catch (error) {
    console.error("Fetch stations error:", error);
    return { error: "Failed to fetch stations" };
  }
}

export async function createStation(data: {
  name: string;
  stationType: string;
  maxVisitsPerHacker?: number | null;
}) {
  try {
    const result = await verifyAdminWithActiveEvent();
    if (result.error) {
      return { error: result.error };
    }

    const [station] = await db
      .insert(eventStation)
      .values({
        id: nanoid(),
        eventId: result.activeEvent!.id,
        name: data.name,
        stationType: data.stationType,
        maxVisitsPerHacker: data.maxVisitsPerHacker ?? null,
        isActive: true,
      })
      .returning();

    return { success: true, station };
  } catch (error) {
    console.error("Create station error:", error);
    return { error: "Failed to create station" };
  }
}

export async function toggleStationActive(stationId: string) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) {
      return { error: authResult.error };
    }

    const station = await db.query.eventStation.findFirst({
      where: eq(eventStation.id, stationId),
    });

    if (!station) {
      return { error: "Station not found" };
    }

    await db
      .update(eventStation)
      .set({ isActive: !station.isActive })
      .where(eq(eventStation.id, stationId));

    return { success: true };
  } catch (error) {
    console.error("Toggle station error:", error);
    return { error: "Failed to toggle station" };
  }
}

export async function deleteStation(stationId: string) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) {
      return { error: authResult.error };
    }

    const existingCheckIns = await db.query.checkIn.findMany({
      where: eq(checkIn.eventStationId, stationId),
      limit: 1,
    });

    if (existingCheckIns.length > 0) {
      return { error: "Cannot delete station with existing check-ins" };
    }

    await db.delete(eventStation).where(eq(eventStation.id, stationId));

    return { success: true };
  } catch (error) {
    console.error("Delete station error:", error);
    return { error: "Failed to delete station" };
  }
}

export async function seedDefaultStations() {
  try {
    const result = await verifyAdminWithActiveEvent();
    if (result.error) {
      return { error: result.error };
    }

    const existingStations = await db.query.eventStation.findMany({
      where: eq(eventStation.eventId, result.activeEvent!.id),
      limit: 1,
    });

    if (existingStations.length > 0) {
      return { error: "Stations already exist for this event" };
    }

    const stationsToInsert = DEFAULT_STATIONS.map((station) => ({
      id: nanoid(),
      eventId: result.activeEvent!.id,
      name: station.name,
      stationType: station.stationType,
      maxVisitsPerHacker: station.maxVisitsPerHacker,
      isActive: true,
    }));

    await db.insert(eventStation).values(stationsToInsert);

    return { success: true, stationsCreated: stationsToInsert.length };
  } catch (error) {
    console.error("Seed stations error:", error);
    return { error: "Failed to seed default stations" };
  }
}

// ============ CHECK-IN ACTIONS ============

export async function lookupRegistrationByQRCode(qrCode: string) {
  try {
    const result = await verifyAdminWithActiveEvent();
    if (result.error) {
      return { error: result.error };
    }

    const registration = await db.query.eventRegistration.findFirst({
      where: and(
        eq(eventRegistration.qrCode, qrCode),
        eq(eventRegistration.eventId, result.activeEvent!.id)
      ),
      with: {
        hackerProfile: true,
        dietaryRestrictions: {
          with: {
            dietaryRestriction: true,
          },
        },
        checkIns: {
          with: {
            eventStation: true,
          },
          orderBy: [desc(checkIn.checkedInAt)],
        },
      },
    });

    if (!registration) {
      return { error: "Registration not found" };
    }

    return {
      registration: {
        id: registration.id,
        qrCode: registration.qrCode,
        isComplete: registration.isComplete,
        hackerProfile: {
          firstName: registration.hackerProfile.firstName,
          lastName: registration.hackerProfile.lastName,
          phoneNumber: registration.hackerProfile.phoneNumber,
        },
        dietaryRestrictions: registration.dietaryRestrictions.map((dr) => ({
          name: dr.dietaryRestriction.name,
          allergyDetails: dr.allergyDetails,
        })),
        checkIns: registration.checkIns.map((ci) => ({
          id: ci.id,
          stationId: ci.eventStationId,
          stationName: ci.eventStation.name,
          stationType: ci.eventStation.stationType,
          checkedInAt: ci.checkedInAt,
        })),
      },
    };
  } catch (error) {
    console.error("Lookup registration error:", error);
    return { error: "Failed to look up registration" };
  }
}

export async function recordCheckIn(data: {
  eventRegistrationId: string;
  eventStationId: string;
  notes?: string;
  overrideDuplicate?: boolean;
}) {
  try {
    const authResult = await verifyAdmin();
    if (authResult.error) {
      return { error: authResult.error };
    }

    const existingCheckIn = await db.query.checkIn.findFirst({
      where: and(
        eq(checkIn.eventRegistrationId, data.eventRegistrationId),
        eq(checkIn.eventStationId, data.eventStationId)
      ),
      orderBy: [desc(checkIn.checkedInAt)],
    });

    if (existingCheckIn && !data.overrideDuplicate) {
      return {
        success: false,
        isDuplicate: true,
        previousCheckIn: {
          id: existingCheckIn.id,
          checkedInAt: existingCheckIn.checkedInAt,
        },
      };
    }

    const station = await db.query.eventStation.findFirst({
      where: eq(eventStation.id, data.eventStationId),
    });

    if (!station) {
      return { error: "Station not found" };
    }

    if (!station.isActive) {
      return { error: "Station is not active" };
    }

    if (station.maxVisitsPerHacker && !data.overrideDuplicate) {
      const checkInCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(checkIn)
        .where(
          and(
            eq(checkIn.eventRegistrationId, data.eventRegistrationId),
            eq(checkIn.eventStationId, data.eventStationId)
          )
        );

      if (checkInCount[0] && checkInCount[0].count >= station.maxVisitsPerHacker) {
        return {
          success: false,
          isDuplicate: true,
          previousCheckIn: existingCheckIn
            ? {
                id: existingCheckIn.id,
                checkedInAt: existingCheckIn.checkedInAt,
              }
            : undefined,
        };
      }
    }

    const [newCheckIn] = await db
      .insert(checkIn)
      .values({
        id: nanoid(),
        eventRegistrationId: data.eventRegistrationId,
        eventStationId: data.eventStationId,
        checkedInAt: new Date(),
        notes: data.notes,
      })
      .returning();

    return { success: true, checkInId: newCheckIn?.id };
  } catch (error) {
    console.error("Record check-in error:", error);
    return { error: "Failed to record check-in" };
  }
}

export async function getStationStats() {
  try {
    const result = await verifyAdminWithActiveEvent();
    if (result.error) {
      return { error: result.error };
    }

    const stations = await db.query.eventStation.findMany({
      where: eq(eventStation.eventId, result.activeEvent!.id),
      with: {
        checkIns: true,
      },
    });

    const stats = stations.map((station) => {
      const uniqueHackers = new Set(
        station.checkIns.map((ci) => ci.eventRegistrationId)
      ).size;

      return {
        stationId: station.id,
        stationName: station.name,
        stationType: station.stationType,
        isActive: station.isActive,
        maxVisitsPerHacker: station.maxVisitsPerHacker,
        totalCheckIns: station.checkIns.length,
        uniqueHackers,
      };
    });

    return { stats };
  } catch (error) {
    console.error("Get station stats error:", error);
    return { error: "Failed to get station stats" };
  }
}
