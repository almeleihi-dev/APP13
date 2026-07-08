import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";
import { readPersonalPassport } from "../../passport/personal-passport-persistence.js";
import { readLocale } from "../../i18n/locale-store.js";
import type { TeamMember, TeamPassport } from "./types.js";
import {
  deriveTeamGlobalCapabilityFromMembers,
  defaultTeamGlobalCapability,
} from "./location-foundation.js";
import {
  appendLivingActivity,
  createLivingId,
  nowIso,
  patchLivingPlatformState,
  readLivingPlatformState,
} from "./living-platform-storage.js";

function memberFromIdentity(identity: ActivePersonalIdentity, role: TeamMember["role"]): TeamMember {
  return {
    passportKey: identity.fullName.trim().toLowerCase(),
    fullName: identity.fullName,
    professionalTitle: identity.professionalTitle,
    photoUrl: identity.photoUrl,
    role,
    skills: [identity.mainSkill, ...identity.actionGroups].filter(Boolean).slice(0, 6),
    joinedAt: nowIso(),
  };
}

function readMemberTrustScore(passportKey: string): number {
  const passport = readPersonalPassport();
  if (!passport || passport.fullName.trim().toLowerCase() !== passportKey) return 72;
  const base = 72;
  const indicatorBoost = passport.trustIndicators.length * 4;
  const actionBoost = Math.min(passport.completedActions * 2, 12);
  return Math.min(98, base + indicatorBoost + actionBoost);
}

export function deriveTeamTrust(team: TeamPassport, contractsCompleted: number, evidenceConfirmed: number): TeamPassport {
  const memberTrustAvg =
    team.members.length > 0
      ? team.members.reduce((sum, member) => sum + readMemberTrustScore(member.passportKey), 0) /
        team.members.length
      : 72;

  const contractBoost = Math.min(contractsCompleted * 5, 25);
  const evidenceBoost = Math.min(evidenceConfirmed * 3, 15);
  const totalContracts = contractsCompleted + Math.max(1, team.completedActions);
  const reliabilityScore = Math.round((contractsCompleted / totalContracts) * 100);

  const trustScore = Math.min(98, Math.round(memberTrustAvg * 0.55 + contractBoost + evidenceBoost + reliabilityScore * 0.15));

  let liveFrameTier: TeamPassport["liveFrameTier"] = "Silver";
  if (trustScore >= 88) liveFrameTier = "Platinum";
  else if (trustScore >= 78) liveFrameTier = "Gold";

  const trustIndicators = [...team.trustIndicators];
  if (contractsCompleted > 0 && !trustIndicators.includes("Team contract delivery")) {
    trustIndicators.push("Team contract delivery");
  }
  if (evidenceConfirmed >= 2 && !trustIndicators.includes("Verified team evidence")) {
    trustIndicators.push("Verified team evidence");
  }
  if (reliabilityScore >= 80 && !trustIndicators.includes("Reliable team execution")) {
    trustIndicators.push("Reliable team execution");
  }

  const combinedSkills = [
    ...new Set(team.members.flatMap((member) => member.skills).filter(Boolean)),
  ].slice(0, 12);

  return {
    ...team,
    combinedSkills,
    trustScore,
    reliabilityScore,
    liveFrameTier,
    trustIndicators,
    globalCapability: team.globalCapability ?? defaultTeamGlobalCapability(),
    updatedAt: nowIso(),
  };
}

function enrichTeam(team: TeamPassport): TeamPassport {
  const state = readLivingPlatformState();
  const teamContracts = state.contracts.filter(
    (contract) =>
      contract.teamId === team.teamId &&
      contract.agreementState === "completed",
  );
  const evidenceConfirmed = state.contracts
    .filter((contract) => contract.teamId === team.teamId)
    .flatMap((contract) => contract.evidence)
    .filter((item) => item.status === "confirmed").length;

  return deriveTeamTrust(team, teamContracts.length, evidenceConfirmed);
}

export function createTeam(identity: ActivePersonalIdentity, name: string): TeamPassport {
  const leader = memberFromIdentity(identity, "leader");
  const passport = readPersonalPassport();
  const globalCapability = deriveTeamGlobalCapabilityFromMembers(
    [identity.location],
    passport?.languages ?? identity.languages ?? [readLocale()],
  );
  const base: TeamPassport = {
    teamId: createLivingId("team"),
    name: name.trim() || `${identity.firstName}'s Team`,
    members: [leader],
    leaderPassportKey: leader.passportKey,
    combinedSkills: leader.skills,
    completedActions: 0,
    trustIndicators: ["Team formed"],
    liveFrameTier: "Silver",
    trustScore: readMemberTrustScore(leader.passportKey),
    reliabilityScore: 70,
    globalCapability,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const team = enrichTeam(base);

  patchLivingPlatformState((state) =>
    appendLivingActivity({ ...state, teams: [team, ...state.teams] }, {
      kind: "team",
      title: "Team created",
      detail: `${team.name} · ${team.teamId}`,
    }),
  );

  return team;
}

export function joinTeam(identity: ActivePersonalIdentity, teamId: string): TeamPassport | null {
  let joined: TeamPassport | null = null;

  patchLivingPlatformState((state) => {
    const index = state.teams.findIndex((team) => team.teamId === teamId);
    if (index < 0) return state;

    const team = state.teams[index]!;
    const key = identity.fullName.trim().toLowerCase();
    if (team.members.some((member) => member.passportKey === key)) {
      joined = enrichTeam(team);
      return state;
    }

    const member = memberFromIdentity(identity, "contributor");
    const locations = [...team.globalCapability?.teamLocations ?? [], identity.location].filter(Boolean);
    const updated = enrichTeam({
      ...team,
      members: [...team.members, member],
      globalCapability: deriveTeamGlobalCapabilityFromMembers(
        locations.length ? locations : [identity.location],
        [readLocale()],
      ),
      updatedAt: nowIso(),
    });
    const teams = [...state.teams];
    teams[index] = updated;
    joined = updated;

    return appendLivingActivity({ ...state, teams }, {
      kind: "team",
      title: "Team member joined",
      detail: `${identity.fullName} joined ${team.name}`,
    });
  });

  return joined;
}

export function getTeam(teamId: string): TeamPassport | null {
  const team = readLivingPlatformState().teams.find((item) => item.teamId === teamId) ?? null;
  return team ? enrichTeam(team) : null;
}

export function listTeamsForMember(identity: ActivePersonalIdentity): TeamPassport[] {
  const key = identity.fullName.trim().toLowerCase();
  return readLivingPlatformState()
    .teams.filter((team) => team.members.some((member) => member.passportKey === key))
    .map(enrichTeam);
}

export function recordTeamContractCompletion(teamId: string): void {
  patchLivingPlatformState((state) => {
    const index = state.teams.findIndex((team) => team.teamId === teamId);
    if (index < 0) return state;

    const team = state.teams[index]!;
    const updated = enrichTeam({
      ...team,
      completedActions: team.completedActions + 1,
      updatedAt: nowIso(),
    });
    const teams = [...state.teams];
    teams[index] = updated;

    return appendLivingActivity({ ...state, teams }, {
      kind: "team",
      title: "Team contract completed",
      detail: `${team.name} · trust updated`,
    });
  });
}
