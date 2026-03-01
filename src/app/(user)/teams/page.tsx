"use client";

import { useState, useEffect, useRef } from "react";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import {
  getTeamStatus,
  createTeam,
  updateTeam,
  leaveTeam,
  searchCheckedInHackers,
  sendInvite,
  respondToInvite,
  cancelInvite,
  getTrackEligibility,
} from "~/server/actions/teams";
import { TRACKS } from "~/constants";

type TeamStatus = Awaited<ReturnType<typeof getTeamStatus>>;

export default function TeamsPage() {
  const [status, setStatus] = useState<TeamStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const result = await getTeamStatus();
      setStatus(result);
    } catch {
      setError("Failed to load team status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (loading) {
    return (
      <ProtectedRoute requireEmailVerification={true}>
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-12">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#44ab48]" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!status?.isCheckedIn) {
    return (
      <ProtectedRoute requireEmailVerification={true}>
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-12">
          <NotCheckedInBanner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireEmailVerification={true}>
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Teams</h1>

        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {status.team ? (
          <TeamView
            team={status.team}
            registrationId={status.registrationId}
            pendingInvitesReceived={status.pendingInvitesReceived}
            onUpdate={() => {
              void loadStatus();
            }}
            onError={setError}
            onSuccess={showSuccess}
          />
        ) : (
          <NoTeamView
            pendingInvitesReceived={status.pendingInvitesReceived}
            onUpdate={() => {
              void loadStatus();
            }}
            onError={setError}
            onSuccess={showSuccess}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function NotCheckedInBanner() {
  return (
    <div className="rounded-xl border border-yellow-400 bg-yellow-50 p-6 md:p-8">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-yellow-400">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Check-in Required
          </h2>
          <p className="mt-1 text-gray-700">
            You need to check in at the event before you can create or join a
            team.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ No Team View ============

function NoTeamView({
  pendingInvitesReceived,
  onUpdate,
  onError,
  onSuccess,
}: {
  pendingInvitesReceived: { id: string; teamName: string; invitedByFirstName: string; invitedByLastName: string }[];
  onUpdate: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}) {
  return (
    <div className="space-y-6">
      <CreateTeamForm onUpdate={onUpdate} onError={onError} onSuccess={onSuccess} />
      {pendingInvitesReceived.length > 0 && (
        <PendingInvitesCard
          invites={pendingInvitesReceived}
          onUpdate={onUpdate}
          onError={onError}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}

function TrackSelector({
  selectedTracks,
  onToggle,
  eligibleTracks,
  disabled,
}: {
  selectedTracks: string[];
  onToggle: (track: string) => void;
  eligibleTracks: string[];
  disabled?: boolean;
}) {
  const eligibleSet = new Set(eligibleTracks);

  const visibleTracks = TRACKS.filter((track) => eligibleSet.has(track.value));

  if (visibleTracks.length === 0) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tracks
      </label>
      <div className="space-y-2">
        {visibleTracks.map((track) => (
          <label
            key={track.value}
            className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="checkbox"
              checked={selectedTracks.includes(track.value)}
              onChange={() => onToggle(track.value)}
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-[#44ab48] focus:ring-[#44ab48]"
            />
            <span className="text-sm text-gray-900">{track.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CreateTeamForm({
  onUpdate,
  onError,
  onSuccess,
}: {
  onUpdate: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [devpostUrl, setDevpostUrl] = useState("");
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [eligibleTracks, setEligibleTracks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      const result = await getTrackEligibility();
      if ("eligible" in result) {
        setEligibleTracks(result.eligible ?? []);
      }
    })();
  }, []);

  const toggleTrack = (track: string) => {
    setSelectedTracks((prev) =>
      prev.includes(track)
        ? prev.filter((t) => t !== track)
        : [...prev, track],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createTeam({
        name: name.trim(),
        projectName: projectName.trim(),
        devpostUrl: devpostUrl.trim(),
        tracks: selectedTracks.length > 0 ? selectedTracks : undefined,
      });
      if ("error" in result && result.error) {
        onError(result.error);
      } else {
        onSuccess("Team created!");
        onUpdate();
      }
    } catch {
      onError("Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Create a Team
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="teamName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            id="teamName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your team name"
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#44ab48] focus:outline-none focus:ring-1 focus:ring-[#44ab48]"
            required
          />
        </div>
        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter your project name"
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#44ab48] focus:outline-none focus:ring-1 focus:ring-[#44ab48]"
            required
          />
        </div>
        <div>
          <label
            htmlFor="devpostUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            DevPost URL <span className="text-red-500">*</span>
          </label>
          <input
            id="devpostUrl"
            type="url"
            value={devpostUrl}
            onChange={(e) => setDevpostUrl(e.target.value)}
            placeholder="https://devpost.com/software/your-project"
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#44ab48] focus:outline-none focus:ring-1 focus:ring-[#44ab48]"
            required
          />
        </div>
        <TrackSelector
          selectedTracks={selectedTracks}
          onToggle={toggleTrack}
          eligibleTracks={eligibleTracks}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !projectName.trim() || !devpostUrl.trim()}
          className="w-full rounded-lg bg-[#44ab48] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#3a9c3e] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Team"}
        </button>
      </form>
    </div>
  );
}

function PendingInvitesCard({
  invites,
  onUpdate,
  onError,
  onSuccess,
}: {
  invites: { id: string; teamName: string; invitedByFirstName: string; invitedByLastName: string }[];
  onUpdate: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}) {
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const handleRespond = async (inviteId: string, accept: boolean) => {
    setRespondingId(inviteId);
    try {
      const result = await respondToInvite({ inviteId, accept });
      if ("error" in result && result.error) {
        onError(result.error);
      } else {
        onSuccess(accept ? "Joined team!" : "Invite declined");
        onUpdate();
      }
    } catch {
      onError("Failed to respond to invite");
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Team Invites
      </h2>
      <div className="divide-y divide-gray-100">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p className="font-medium text-gray-900">{invite.teamName}</p>
              <p className="text-sm text-gray-500">
                Invited by {invite.invitedByFirstName}{" "}
                {invite.invitedByLastName}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRespond(invite.id, true)}
                disabled={respondingId === invite.id}
                className="rounded-lg bg-[#44ab48] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#3a9c3e] disabled:opacity-50"
              >
                Accept
              </button>
              <button
                onClick={() => handleRespond(invite.id, false)}
                disabled={respondingId === invite.id}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Team View ============

function TeamView({
  team,
  registrationId,
  pendingInvitesReceived,
  onUpdate,
  onError,
  onSuccess,
}: {
  team: {
    id: string;
    name: string;
    projectName: string | null;
    devpostUrl: string | null;
    captainRegistrationId: string;
    tracks: string[];
    members: {
      id: string;
      registrationId: string;
      firstName: string;
      lastName: string;
      isCaptain: boolean;
      joinedAt: Date;
    }[];
    pendingInvites: {
      id: string;
      registrationId: string;
      firstName: string;
      lastName: string;
    }[];
  };
  registrationId: string;
  pendingInvitesReceived: { id: string; teamName: string; invitedByFirstName: string; invitedByLastName: string }[];
  onUpdate: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}) {
  const isCaptain = team.captainRegistrationId === registrationId;
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async () => {
    if (
      !confirm(
        isCaptain && team.members.length > 1
          ? "You are the captain. Leaving will transfer captaincy to the next member. Continue?"
          : team.members.length === 1
            ? "You are the last member. Leaving will delete the team. Continue?"
            : "Are you sure you want to leave this team?",
      )
    ) {
      return;
    }

    setIsLeaving(true);
    try {
      const result = await leaveTeam(team.id);
      if ("error" in result && result.error) {
        onError(result.error);
      } else {
        onSuccess("Left team");
        onUpdate();
      }
    } catch {
      onError("Failed to leave team");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Info Card */}
      <TeamInfoCard
        team={team}
        isCaptain={isCaptain}
        onUpdate={onUpdate}
        onError={onError}
        onSuccess={onSuccess}
      />

      {/* Members */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Members</h2>
          <span className="text-sm text-gray-500">
            {team.members.length}/4 members
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                  {member.firstName[0]}
                  {member.lastName[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                    {member.registrationId === registrationId && (
                      <span className="ml-1 text-gray-400">(you)</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.isCaptain && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    Captain
                  </span>
                )}
                {member.registrationId === registrationId && (
                  <button
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {isLeaving ? "Leaving..." : "Leave"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Captain: Invite section */}
      {isCaptain && team.members.length < 4 && (
        <InviteSection
          teamId={team.id}
          pendingInvites={team.pendingInvites}
          onUpdate={onUpdate}
          onError={onError}
          onSuccess={onSuccess}
        />
      )}

      {/* Pending invites for captain when team is full */}
      {isCaptain && team.members.length >= 4 && team.pendingInvites.length > 0 && (
        <PendingOutgoingInvites
          invites={team.pendingInvites}
          onUpdate={onUpdate}
          onError={onError}
          onSuccess={onSuccess}
        />
      )}

      {/* Invites received from other teams */}
      {pendingInvitesReceived.length > 0 && (
        <PendingInvitesCard
          invites={pendingInvitesReceived}
          onUpdate={onUpdate}
          onError={onError}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}

function TeamInfoCard({
  team,
  isCaptain,
  onUpdate,
  onError,
  onSuccess,
}: {
  team: { id: string; name: string; projectName: string | null; devpostUrl: string | null; tracks: string[] };
  isCaptain: boolean;
  onUpdate: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [editProject, setEditProject] = useState(team.projectName ?? "");
  const [editDevpost, setEditDevpost] = useState(team.devpostUrl ?? "");
  const [editTracks, setEditTracks] = useState<string[]>(team.tracks);
  const [eligibleTracks, setEligibleTracks] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      void (async () => {
        const result = await getTrackEligibility(team.id);
        if ("eligible" in result) {
          setEligibleTracks(result.eligible ?? []);
        }
      })();
    }
  }, [isEditing, team.id]);

  const toggleTrack = (track: string) => {
    setEditTracks((prev) =>
      prev.includes(track)
        ? prev.filter((t) => t !== track)
        : [...prev, track],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateTeam({
        teamId: team.id,
        name: editName,
        projectName: editProject.trim(),
        devpostUrl: editDevpost.trim(),
        tracks: editTracks,
      });
      if ("error" in result && result.error) {
        onError(result.error);
      } else {
        onSuccess("Team updated");
        setIsEditing(false);
        onUpdate();
      }
    } catch {
      onError("Failed to update team");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-[#44ab48] focus:outline-none focus:ring-1 focus:ring-[#44ab48]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editProject}
              onChange={(e) => setEditProject(e.target.value)}
              placeholder="Enter your project name"
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#44ab48] focus:outline-none focus:ring-1 focus:ring-[#44ab48]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DevPost URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={editDevpost}
              onChange={(e) => setEditDevpost(e.target.value)}
              placeholder="https://devpost.com/software/your-project"
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#44ab48] focus:outline-none focus:ring-1 focus:ring-[#44ab48]"
              required
            />
          </div>
          <TrackSelector
            selectedTracks={editTracks}
            onToggle={toggleTrack}
            eligibleTracks={eligibleTracks}
            disabled={isSaving}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !editName.trim() || !editProject.trim() || !editDevpost.trim()}
              className="rounded-lg bg-[#44ab48] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3a9c3e] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditName(team.name);
                setEditProject(team.projectName ?? "");
                setEditDevpost(team.devpostUrl ?? "");
                setEditTracks(team.tracks);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{team.name}</h2>
            {team.projectName && (
              <p className="mt-1 text-sm text-gray-500">
                Project: {team.projectName}
              </p>
            )}
            {team.devpostUrl && (
              <p className="mt-1 text-sm">
                <a
                  href={team.devpostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#44ab48] hover:underline"
                >
                  DevPost Submission
                </a>
              </p>
            )}
            {team.tracks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {team.tracks.map((t) => {
                  const def = TRACKS.find((tr) => tr.value === t);
                  return (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                    >
                      {def?.label ?? t}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          {isCaptain && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              title="Edit team"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function InviteSection({
  teamId,
  pendingInvites,
  onUpdate,
  onError,
  onSuccess,
}: {
  teamId: string;
  pendingInvites: { id: string; registrationId: string; firstName: string; lastName: string }[];
  onUpdate: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { registrationId: string; firstName: string; lastName: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      void (async () => {
        try {
          const result = await searchCheckedInHackers(searchQuery, teamId);
          if ("error" in result && result.error) {
            setSearchResults([]);
          } else {
            setSearchResults(result.results ?? []);
          }
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, teamId]);

  const handleInvite = async (registrationId: string) => {
    setSendingTo(registrationId);
    try {
      const result = await sendInvite({ teamId, registrationId });
      if ("error" in result && result.error) {
        onError(result.error);
      } else {
        onSuccess("Invite sent!");
        setSearchQuery("");
        setSearchResults([]);
        onUpdate();
      }
    } catch {
      onError("Failed to send invite");
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Invite Members
      </h2>

      {/* Search input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search checked-in hackers by name..."
          className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#44ab48] focus:outline-none focus:ring-1 focus:ring-[#44ab48]"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#44ab48]" />
          </div>
        )}
      </div>

      {/* Search results */}
      {searchQuery.trim().length >= 2 && (
        <div className="mt-2">
          {isSearching ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 max-h-48 overflow-y-auto">
              {searchResults.map((person) => (
                <div
                  key={person.registrationId}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <p className="font-medium text-gray-900">
                    {person.firstName} {person.lastName}
                  </p>
                  <button
                    onClick={() => handleInvite(person.registrationId)}
                    disabled={sendingTo === person.registrationId}
                    className="rounded-lg bg-[#44ab48] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#3a9c3e] disabled:opacity-50"
                  >
                    {sendingTo === person.registrationId
                      ? "Sending..."
                      : "Invite"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
              No checked-in hackers found
            </div>
          )}
        </div>
      )}

      {/* Pending outgoing invites */}
      {pendingInvites.length > 0 && (
        <PendingOutgoingInvites
          invites={pendingInvites}
          onUpdate={onUpdate}
          onError={onError}
          onSuccess={onSuccess}
          inline
        />
      )}
    </div>
  );
}

function PendingOutgoingInvites({
  invites,
  onUpdate,
  onError,
  onSuccess,
  inline = false,
}: {
  invites: { id: string; registrationId: string; firstName: string; lastName: string }[];
  onUpdate: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
  inline?: boolean;
}) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (inviteId: string) => {
    setCancellingId(inviteId);
    try {
      const result = await cancelInvite(inviteId);
      if ("error" in result && result.error) {
        onError(result.error);
      } else {
        onSuccess("Invite cancelled");
        onUpdate();
      }
    } catch {
      onError("Failed to cancel invite");
    } finally {
      setCancellingId(null);
    }
  };

  const content = (
    <>
      <h3 className={`font-medium text-gray-700 ${inline ? "mt-4 mb-2 text-sm" : "mb-3 text-lg"}`}>
        Pending Invites
      </h3>
      <div className="divide-y divide-gray-100">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between py-2"
          >
            <p className="text-sm text-gray-900">
              {invite.firstName} {invite.lastName}
            </p>
            <button
              onClick={() => handleCancel(invite.id)}
              disabled={cancellingId === invite.id}
              className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {cancellingId === invite.id ? "..." : "Cancel"}
            </button>
          </div>
        ))}
      </div>
    </>
  );

  if (inline) return content;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {content}
    </div>
  );
}
