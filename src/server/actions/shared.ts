"use server";

import { db } from "~/server/db";
import { event as eventTable } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "~/server/auth";
import { headers } from "next/headers";

// ============ Auth Helpers ============

export async function verifyAdmin() {
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

export async function getActiveEvent() {
  return db.query.event.findFirst({
    where: eq(eventTable.isActive, true),
  });
}

/**
 * Combined helper that verifies admin and gets active event.
 * Use this when you need both auth check and active event.
 */
export async function verifyAdminWithActiveEvent() {
  const authResult = await verifyAdmin();
  if (authResult.error) {
    return { error: authResult.error };
  }

  const activeEvent = await getActiveEvent();
  if (!activeEvent) {
    return { error: "No active event found" };
  }

  return { session: authResult.session, user: authResult.user, activeEvent };
}
