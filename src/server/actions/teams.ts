"use server";

import { db } from "~/server/db";
import {
  hackerProfile,
  eventRegistration,
  eventRegistrationEducation,
  eventStation,
  checkIn,
  team,
  teamMember,
  teamInvite,
  teamTrack,
} from "~/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "~/server/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { getActiveEvent } from "./shared";
import { TRACKS, MST_SCHOOL_NAME } from "~/constants";
import type { TrackValue } from "~/constants";

// ============ Helper ============

async function getCurrentUserRegistration() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Not authenticated" as const };
  }

  const activeEvent = await getActiveEvent();
  if (!activeEvent) {
    return { error: "No active event found" as const };
  }

  const profile = await db.query.hackerProfile.findFirst({
    where: eq(hackerProfile.userId, session.user.id),
  });

  if (!profile) {
    return { error: "No profile found" as const };
  }

  const registration = await db.query.eventRegistration.findFirst({
    where: and(
      eq(eventRegistration.hackerProfileId, profile.id),
      eq(eventRegistration.eventId, activeEvent.id),
    ),
  });

  if (!registration) {
    return { error: "No registration found" as const };
  }

  // Step 1: Find all "checkin" type stations for this event
  const checkinTypeStations = await db
    .select({ id: eventStation.id })
    .from(eventStation)
    .where(
      and(
        eq(eventStation.eventId, activeEvent.id),
        eq(eventStation.stationType, "checkin"),
      ),
    );

  if (checkinTypeStations.length === 0) {
    console.warn("[teams] No checkin-type stations found for event", activeEvent.id);
    return { session, profile, registration, activeEvent, isCheckedIn: false };
  }

  // Step 2: Check if user has a check-in record at any of those stations
  const stationIds = checkinTypeStations.map((s) => s.id);
  const userCheckins = await db
    .select({ id: checkIn.id })
    .from(checkIn)
    .where(
      and(
        eq(checkIn.eventRegistrationId, registration.id),
        inArray(checkIn.eventStationId, stationIds),
      ),
    )
    .limit(1);

  const isCheckedIn = userCheckins.length > 0;

  if (!isCheckedIn) {
    console.warn("[teams] User registration", registration.id, "has no check-in at stations", stationIds);
  }

  return { session, profile, registration, activeEvent, isCheckedIn };
}

// ============ Track Helpers ============

async function getEligibleTracks(teamId: string): Promise<Set<TrackValue>> {
  const members = await db.query.teamMember.findMany({
    where: eq(teamMember.teamId, teamId),
    with: {
      registration: {
        with: {
          education: {
            with: {
              school: true,
            },
          },
        },
      },
    },
  });

  const eligible = new Set<TrackValue>();

  for (const track of TRACKS) {
    if (track.conditional === null) {
      eligible.add(track.value);
    }
  }

  if (members.length === 1) {
    eligible.add("best_solo");
  }

  const allFromMST =
    members.length > 0 &&
    members.every((m) => m.registration.education?.school?.name === MST_SCHOOL_NAME);
  if (allFromMST) {
    eligible.add("tip_crystal_ball");
  }

  return eligible;
}

function validateTrackSelection(
  requestedTracks: string[],
  eligibleTracks: Set<TrackValue>,
): { valid: TrackValue[] } | { error: string } {
  const validTrackValues = new Set<string>(TRACKS.map((t) => t.value));

  for (const t of requestedTracks) {
    if (!validTrackValues.has(t)) {
      return { error: `Invalid track: ${t}` };
    }
    if (!eligibleTracks.has(t as TrackValue)) {
      const trackDef = TRACKS.find((tr) => tr.value === t);
      return {
        error: `Your team is not eligible for "${trackDef?.label ?? t}"`,
      };
    }
  }

  const unique = [...new Set(requestedTracks)] as TrackValue[];
  return { valid: unique };
}

async function pruneIneligibleTracks(teamId: string): Promise<void> {
  const eligible = await getEligibleTracks(teamId);

  const currentTracks = await db.query.teamTrack.findMany({
    where: eq(teamTrack.teamId, teamId),
  });

  const toRemove = currentTracks.filter(
    (ct) => !eligible.has(ct.track as TrackValue),
  );

  if (toRemove.length > 0) {
    await db
      .delete(teamTrack)
      .where(
        and(
          eq(teamTrack.teamId, teamId),
          inArray(
            teamTrack.track,
            toRemove.map((t) => t.track),
          ),
        ),
      );
  }
}

// ============ Server Actions ============

export async function getTeamStatus() {
  try {
    const ctx = await getCurrentUserRegistration();
    if ("error" in ctx) {
      return {
        isCheckedIn: false,
        team: null,
        registrationId: "",
        pendingInvitesReceived: [] as {
          id: string;
          teamName: string;
          invitedByFirstName: string;
          invitedByLastName: string;
        }[],
      };
    }

    const { registration, isCheckedIn } = ctx;

    if (!isCheckedIn) {
      return {
        isCheckedIn: false,
        team: null,
        registrationId: registration.id,
        pendingInvitesReceived: [] as {
          id: string;
          teamName: string;
          invitedByFirstName: string;
          invitedByLastName: string;
        }[],
      };
    }

    // Find current team membership
    const membership = await db.query.teamMember.findFirst({
      where: eq(teamMember.registrationId, registration.id),
      with: {
        team: {
          with: {
            members: {
              with: {
                registration: {
                  with: {
                    hackerProfile: true,
                  },
                },
              },
            },
            invites: {
              with: {
                registration: {
                  with: {
                    hackerProfile: true,
                  },
                },
              },
            },
            tracks: true,
          },
        },
      },
    });

    let teamData = null;
    if (membership) {
      const t = membership.team;
      teamData = {
        id: t.id,
        name: t.name,
        projectName: t.projectName,
        captainRegistrationId: t.captainRegistrationId,
        tracks: t.tracks.map((tr) => tr.track),
        members: t.members.map((m) => ({
          id: m.id,
          registrationId: m.registrationId,
          firstName: m.registration.hackerProfile.firstName,
          lastName: m.registration.hackerProfile.lastName,
          isCaptain: m.registrationId === t.captainRegistrationId,
          joinedAt: m.joinedAt,
        })),
        pendingInvites: t.invites.map((inv) => ({
          id: inv.id,
          registrationId: inv.registrationId,
          firstName: inv.registration.hackerProfile.firstName,
          lastName: inv.registration.hackerProfile.lastName,
        })),
      };
    }

    // Get pending invites received from other teams
    const receivedInvites = await db.query.teamInvite.findMany({
      where: eq(teamInvite.registrationId, registration.id),
      with: {
        team: true,
        invitedByRegistration: {
          with: {
            hackerProfile: true,
          },
        },
      },
    });

    const pendingInvitesReceived = receivedInvites.map((inv) => ({
      id: inv.id,
      teamName: inv.team.name,
      invitedByFirstName: inv.invitedByRegistration.hackerProfile.firstName,
      invitedByLastName: inv.invitedByRegistration.hackerProfile.lastName,
    }));

    return {
      isCheckedIn: true,
      team: teamData,
      registrationId: registration.id,
      pendingInvitesReceived,
    };
  } catch (error) {
    console.error("Get team status error:", error);
    return {
      isCheckedIn: false,
      team: null,
      registrationId: "",
      pendingInvitesReceived: [] as {
        id: string;
        teamName: string;
        invitedByFirstName: string;
        invitedByLastName: string;
      }[],
    };
  }
}

export async function createTeam({
  name,
  projectName,
  tracks: requestedTracks,
}: {
  name: string;
  projectName?: string;
  tracks?: string[];
}) {
  try {
    const ctx = await getCurrentUserRegistration();
    if ("error" in ctx) {
      return { error: ctx.error };
    }
    if (!ctx.isCheckedIn) {
      return { error: "You must check in before creating a team" };
    }

    const { registration, activeEvent } = ctx;

    // Check if user is already on a team
    const existingMembership = await db.query.teamMember.findFirst({
      where: eq(teamMember.registrationId, registration.id),
    });
    if (existingMembership) {
      return { error: "You are already on a team. Leave your current team first." };
    }

    if (!name.trim()) {
      return { error: "Team name is required" };
    }

    const teamId = nanoid();

    await db.insert(team).values({
      id: teamId,
      eventId: activeEvent.id,
      name: name.trim(),
      projectName: projectName?.trim() ?? null,
      captainRegistrationId: registration.id,
    });

    await db.insert(teamMember).values({
      id: nanoid(),
      teamId,
      registrationId: registration.id,
    });

    // Handle tracks
    if (requestedTracks && requestedTracks.length > 0) {
      const eligible = await getEligibleTracks(teamId);
      const validation = validateTrackSelection(requestedTracks, eligible);
      if ("error" in validation) {
        return { error: validation.error };
      }
      if (validation.valid.length > 0) {
        await db.insert(teamTrack).values(
          validation.valid.map((track) => ({
            id: nanoid(),
            teamId,
            track,
          })),
        );
      }
    }

    return { success: true as const };
  } catch (error) {
    console.error("Create team error:", error);
    return { error: "Failed to create team" };
  }
}

export async function updateTeam({
  teamId,
  name,
  projectName,
  tracks: requestedTracks,
}: {
  teamId: string;
  name: string;
  projectName: string | null;
  tracks?: string[];
}) {
  try {
    const ctx = await getCurrentUserRegistration();
    if ("error" in ctx) {
      return { error: ctx.error };
    }

    const { registration } = ctx;

    const existingTeam = await db.query.team.findFirst({
      where: eq(team.id, teamId),
    });

    if (!existingTeam) {
      return { error: "Team not found" };
    }

    if (existingTeam.captainRegistrationId !== registration.id) {
      return { error: "Only the team captain can edit team details" };
    }

    if (!name.trim()) {
      return { error: "Team name is required" };
    }

    await db
      .update(team)
      .set({
        name: name.trim(),
        projectName: projectName?.trim() ?? null,
      })
      .where(eq(team.id, teamId));

    // Replace tracks
    if (requestedTracks !== undefined) {
      await db.delete(teamTrack).where(eq(teamTrack.teamId, teamId));

      if (requestedTracks.length > 0) {
        const eligible = await getEligibleTracks(teamId);
        const validation = validateTrackSelection(requestedTracks, eligible);
        if ("error" in validation) {
          return { error: validation.error };
        }
        if (validation.valid.length > 0) {
          await db.insert(teamTrack).values(
            validation.valid.map((track) => ({
              id: nanoid(),
              teamId,
              track,
            })),
          );
        }
      }
    }

    return { success: true as const };
  } catch (error) {
    console.error("Update team error:", error);
    return { error: "Failed to update team" };
  }
}

export async function leaveTeam(teamId: string) {
  try {
    const ctx = await getCurrentUserRegistration();
    if ("error" in ctx) {
      return { error: ctx.error };
    }

    const { registration } = ctx;

    const existingTeam = await db.query.team.findFirst({
      where: eq(team.id, teamId),
      with: {
        members: true,
      },
    });

    if (!existingTeam) {
      return { error: "Team not found" };
    }

    const isMember = existingTeam.members.some(
      (m) => m.registrationId === registration.id,
    );
    if (!isMember) {
      return { error: "You are not a member of this team" };
    }

    // Remove the member
    await db
      .delete(teamMember)
      .where(
        and(
          eq(teamMember.teamId, teamId),
          eq(teamMember.registrationId, registration.id),
        ),
      );

    const remainingMembers = existingTeam.members.filter(
      (m) => m.registrationId !== registration.id,
    );

    if (remainingMembers.length === 0) {
      // Last member left — delete the team (cascade deletes invites + tracks)
      await db.delete(team).where(eq(team.id, teamId));
    } else {
      if (existingTeam.captainRegistrationId === registration.id) {
        // Captain left — transfer to random remaining member
        const randomIndex = Math.floor(Math.random() * remainingMembers.length);
        const newCaptain = remainingMembers[randomIndex]!;

        await db
          .update(team)
          .set({ captainRegistrationId: newCaptain.registrationId })
          .where(eq(team.id, teamId));
      }

      // Prune tracks that may no longer be valid
      await pruneIneligibleTracks(teamId);
    }

    return { success: true as const };
  } catch (error) {
    console.error("Leave team error:", error);
    return { error: "Failed to leave team" };
  }
}

export async function searchCheckedInHackers(query: string, teamId: string) {
  try {
    const ctx = await getCurrentUserRegistration();
    if ("error" in ctx) {
      return { error: ctx.error };
    }

    const { activeEvent } = ctx;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { results: [] as { registrationId: string; firstName: string; lastName: string }[] };
    }

    // Get registrations that have checked in at a "checkin" station
    const checkedInRegIds = await db
      .select({ registrationId: checkIn.eventRegistrationId })
      .from(checkIn)
      .innerJoin(eventStation, eq(checkIn.eventStationId, eventStation.id))
      .innerJoin(eventRegistration, eq(checkIn.eventRegistrationId, eventRegistration.id))
      .where(
        and(
          eq(eventRegistration.eventId, activeEvent.id),
          eq(eventStation.stationType, "checkin"),
        ),
      );

    const checkedInSet = new Set(checkedInRegIds.map((r) => r.registrationId));

    // Get all registrations with profiles for name matching
    const registrations = await db.query.eventRegistration.findMany({
      where: eq(eventRegistration.eventId, activeEvent.id),
      with: {
        hackerProfile: true,
      },
    });

    const checkedIn = registrations.filter((reg) => checkedInSet.has(reg.id));

    // Get current team members and pending invites to exclude
    const currentMembers = await db.query.teamMember.findMany({
      where: eq(teamMember.teamId, teamId),
    });
    const memberRegIds = new Set(currentMembers.map((m) => m.registrationId));

    const pendingInvites = await db.query.teamInvite.findMany({
      where: eq(teamInvite.teamId, teamId),
    });
    const invitedRegIds = new Set(pendingInvites.map((i) => i.registrationId));

    const searchLower = trimmed.toLowerCase();
    const filtered = checkedIn.filter((reg) => {
      if (memberRegIds.has(reg.id) || invitedRegIds.has(reg.id)) return false;

      const first = reg.hackerProfile.firstName.toLowerCase();
      const last = reg.hackerProfile.lastName.toLowerCase();
      const full = `${first} ${last}`;

      return full.includes(searchLower) || first.includes(searchLower) || last.includes(searchLower);
    });

    return {
      results: filtered.slice(0, 20).map((reg) => ({
        registrationId: reg.id,
        firstName: reg.hackerProfile.firstName,
        lastName: reg.hackerProfile.lastName,
      })),
    };
  } catch (error) {
    console.error("Search checked-in hackers error:", error);
    return { error: "Failed to search hackers" };
  }
}

export async function sendInvite({
  teamId,
  registrationId,
}: {
  teamId: string;
  registrationId: string;
}) {
  try {
    const ctx = await getCurrentUserRegistration();
    if ("error" in ctx) {
      return { error: ctx.error };
    }

    const { registration } = ctx;

    const existingTeam = await db.query.team.findFirst({
      where: eq(team.id, teamId),
      with: {
        members: true,
        invites: true,
      },
    });

    if (!existingTeam) {
      return { error: "Team not found" };
    }

    if (existingTeam.captainRegistrationId !== registration.id) {
      return { error: "Only the team captain can send invites" };
    }

    if (existingTeam.members.length >= 4) {
      return { error: "Team is already full (max 4 members)" };
    }

    if (existingTeam.members.some((m) => m.registrationId === registrationId)) {
      return { error: "This person is already on your team" };
    }

    if (existingTeam.invites.some((i) => i.registrationId === registrationId)) {
      return { error: "An invite has already been sent to this person" };
    }

    // Verify target registration exists and is checked in
    const targetReg = await db.query.eventRegistration.findFirst({
      where: eq(eventRegistration.id, registrationId),
    });

    if (!targetReg) {
      return { error: "Registration not found" };
    }

    const targetCheckin = await db
      .select({ id: checkIn.id })
      .from(checkIn)
      .innerJoin(eventStation, eq(checkIn.eventStationId, eventStation.id))
      .where(
        and(
          eq(checkIn.eventRegistrationId, registrationId),
          eq(eventStation.stationType, "checkin"),
        ),
      )
      .limit(1);

    if (targetCheckin.length === 0) {
      return { error: "This person has not checked in yet" };
    }

    await db.insert(teamInvite).values({
      id: nanoid(),
      teamId,
      registrationId,
      invitedByRegistrationId: registration.id,
    });

    return { success: true as const };
  } catch (error) {
    console.error("Send invite error:", error);
    return { error: "Failed to send invite" };
  }
}

export async function respondToInvite({
  inviteId,
  accept,
}: {
  inviteId: string;
  accept: boolean;
}) {
  try {
    const ctx = await getCurrentUserRegistration();
    if ("error" in ctx) {
      return { error: ctx.error };
    }

    const { registration } = ctx;

    const invite = await db.query.teamInvite.findFirst({
      where: eq(teamInvite.id, inviteId),
      with: {
        team: {
          with: {
            members: true,
          },
        },
      },
    });

    if (!invite) {
      return { error: "Invite not found" };
    }

    if (invite.registrationId !== registration.id) {
      return { error: "This invite is not for you" };
    }

    if (!accept) {
      await db.delete(teamInvite).where(eq(teamInvite.id, inviteId));
      return { success: true as const };
    }

    // Accept: validate constraints
    const existingMembership = await db.query.teamMember.findFirst({
      where: eq(teamMember.registrationId, registration.id),
    });
    if (existingMembership) {
      return { error: "You must leave your current team before joining another" };
    }

    if (invite.team.members.length >= 4) {
      await db.delete(teamInvite).where(eq(teamInvite.id, inviteId));
      return { error: "This team is already full" };
    }

    // Add user to team
    await db.insert(teamMember).values({
      id: nanoid(),
      teamId: invite.teamId,
      registrationId: registration.id,
    });

    // Delete all pending invites to this user (they've joined a team)
    await db
      .delete(teamInvite)
      .where(eq(teamInvite.registrationId, registration.id));

    // Prune tracks that may no longer be valid with new team composition
    await pruneIneligibleTracks(invite.teamId);

    return { success: true as const };
  } catch (error) {
    console.error("Respond to invite error:", error);
    return { error: "Failed to respond to invite" };
  }
}

export async function cancelInvite(inviteId: string) {
  try {
    const ctx = await getCurrentUserRegistration();
    if ("error" in ctx) {
      return { error: ctx.error };
    }

    const { registration } = ctx;

    const invite = await db.query.teamInvite.findFirst({
      where: eq(teamInvite.id, inviteId),
      with: {
        team: true,
      },
    });

    if (!invite) {
      return { error: "Invite not found" };
    }

    if (invite.team.captainRegistrationId !== registration.id) {
      return { error: "Only the team captain can cancel invites" };
    }

    await db.delete(teamInvite).where(eq(teamInvite.id, inviteId));

    return { success: true as const };
  } catch (error) {
    console.error("Cancel invite error:", error);
    return { error: "Failed to cancel invite" };
  }
}

export async function getTrackEligibility(teamId?: string) {
  try {
    const ctx = await getCurrentUserRegistration();
    if ("error" in ctx) {
      return { error: ctx.error };
    }

    if (teamId) {
      // Existing team: check based on current composition
      const eligible = await getEligibleTracks(teamId);
      return { eligible: Array.from(eligible) };
    }

    // No team yet (create form): solo creator
    // Solo is always eligible at creation, check MST status for TIP Crystal Ball
    const education = await db.query.eventRegistrationEducation.findFirst({
      where: eq(
        eventRegistrationEducation.eventRegistrationId,
        ctx.registration.id,
      ),
      with: { school: true },
    });

    // At creation, team is solo (1 member), so all unconditional + solo are eligible
    const eligible: TrackValue[] = TRACKS.filter(
      (t) => t.conditional === null || t.conditional === "solo",
    ).map((t) => t.value);

    if (education?.school?.name === MST_SCHOOL_NAME) {
      eligible.push("tip_crystal_ball");
    }

    return { eligible };
  } catch (error) {
    console.error("Get track eligibility error:", error);
    return { error: "Failed to check track eligibility" };
  }
}
