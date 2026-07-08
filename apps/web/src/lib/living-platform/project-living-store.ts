import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";
import type {
  ActionContract,
  ActionContractDetails,
  ActionServiceRequest,
  LivingProject,
  MicroActionContractScope,
  ProjectExecutionPath,
  ProjectPhase,
} from "./types.js";
import {
  appendLivingActivity,
  createLivingId,
  nowIso,
  patchLivingPlatformState,
  readLivingPlatformState,
} from "./living-platform-storage.js";
import {
  buildProjectPhases,
  deriveProjectName,
  matchProjectTemplate,
} from "./project-decomposition-engine.js";
import { defaultProjectLocation } from "./location-foundation.js";
import { getTeam, recordTeamContractCompletion } from "./team-passport-store.js";
import { acceptActionContract } from "./action-contract-store.js";

function passportKey(identity: ActivePersonalIdentity): string {
  return identity.fullName.trim().toLowerCase();
}

function updateProject(projectId: string, updater: (project: LivingProject) => LivingProject): LivingProject | null {
  let updated: LivingProject | null = null;
  patchLivingPlatformState((state) => {
    const index = state.projects.findIndex((project) => project.projectId === projectId);
    if (index < 0) return state;
    updated = updater(state.projects[index]!);
    const projects = [...state.projects];
    projects[index] = updated;
    return { ...state, projects };
  });
  return updated;
}

function deriveProjectMetrics(project: LivingProject): LivingProject {
  const totalPhases = project.phases.length;
  const completedPhaseCount = project.phases.filter((phase) => phase.status === "completed").length;
  const progressPercent = totalPhases > 0 ? Math.round((completedPhaseCount / totalPhases) * 100) : 0;

  const activeContracts = project.phases
    .flatMap((phase) => phase.subPhases)
    .flatMap((sub) => sub.microActions)
    .map((micro) => micro.contractId)
    .filter((id): id is string => Boolean(id));

  const evidenceHistory = project.phases.flatMap((phase) => phase.evidence);
  const pendingMicro = project.phases
    .flatMap((phase) => phase.subPhases)
    .flatMap((sub) => sub.microActions)
    .filter((micro) => micro.status !== "completed").length;

  const riskIndicators: string[] = [];
  if (pendingMicro > 6) riskIndicators.push("High pending micro-action backlog");
  if (project.phases.some((phase) => phase.status === "in_progress" && phase.paidAmount === 0)) {
    riskIndicators.push("Phase in progress without payment recorded");
  }
  if (completedPhaseCount === 0 && project.phases.some((phase) => phase.status === "in_progress")) {
    riskIndicators.push("Early execution — monitor phase evidence");
  }

  let liveFrameHealth: LivingProject["liveFrameHealth"] = "healthy";
  if (riskIndicators.length >= 2) liveFrameHealth = "at_risk";
  else if (riskIndicators.length === 1) liveFrameHealth = "watch";

  let executionStatus = project.executionStatus;
  if (progressPercent >= 100) executionStatus = "completed";
  else if (completedPhaseCount > 0 || project.phases.some((p) => p.status === "in_progress")) {
    executionStatus = "executing";
  }

  const trustLevel = Math.min(98, 60 + completedPhaseCount * 8 + evidenceHistory.length * 4);

  return {
    ...project,
    progressPercent,
    completedPhaseCount,
    activeContractIds: activeContracts,
    evidenceHistory,
    riskIndicators,
    trustLevel,
    executionStatus,
    liveFrameHealth,
    updatedAt: nowIso(),
  };
}

export function createProjectFromGoal(
  identity: ActivePersonalIdentity,
  goal: string,
  path: ProjectExecutionPath,
  teamId: string | null = null,
): LivingProject {
  const template = matchProjectTemplate(goal);
  const phases = buildProjectPhases(template, path);
  const projectLocation = {
    ...defaultProjectLocation(template.templateId),
    country: identity.geoProfile?.country ?? "",
    city: identity.geoProfile?.city ?? "",
  };

  const project: LivingProject = deriveProjectMetrics({
    projectId: createLivingId("prj"),
    goal: goal.trim(),
    name: deriveProjectName(goal, template),
    templateId: template.templateId,
    teamId,
    creatorPassportKey: passportKey(identity),
    selectedPath: path,
    phases,
    progressPercent: 0,
    completedPhaseCount: 0,
    activeContractIds: [],
    evidenceHistory: [],
    riskIndicators: [],
    trustLevel: 60,
    executionStatus: "planning",
    liveFrameHealth: "healthy",
    projectLocation,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  patchLivingPlatformState((state) =>
    appendLivingActivity({ ...state, projects: [project, ...state.projects] }, {
      kind: "project",
      title: "Project decomposed",
      detail: `${project.name} · ${phases.length} phases · ${template.label}`,
    }),
  );

  return project;
}

export function getProject(projectId: string): LivingProject | null {
  const project = readLivingPlatformState().projects.find((item) => item.projectId === projectId) ?? null;
  return project ? deriveProjectMetrics(project) : null;
}

export function listProjectsForIdentity(identity: ActivePersonalIdentity): LivingProject[] {
  const key = passportKey(identity);
  return readLivingPlatformState()
    .projects.filter((project) => project.creatorPassportKey === key)
    .map(deriveProjectMetrics);
}

export function payProjectPhase(projectId: string, phaseId: string, amount?: number): LivingProject | null {
  return updateProject(projectId, (project) => {
    const phases = project.phases.map((phase) => {
      if (phase.phaseId !== phaseId) return phase;
      if (phase.status === "locked") return phase;
      const paidAmount = amount ?? phase.estimatedCost;
      return {
        ...phase,
        status: "in_progress" as const,
        paidAmount: Math.min(phase.estimatedCost, paidAmount),
      };
    });

    return deriveProjectMetrics({ ...project, phases, executionStatus: "executing" });
  });
}

export function attachProjectPhaseEvidence(
  projectId: string,
  phaseId: string,
  label: string,
  description: string,
): LivingProject | null {
  return updateProject(projectId, (project) => {
    const phases = project.phases.map((phase) => {
      if (phase.phaseId !== phaseId) return phase;
      const evidence = {
        id: createLivingId("pev"),
        label,
        description,
        attachedAt: nowIso(),
      };
      return { ...phase, evidence: [...phase.evidence, evidence] };
    });
    return deriveProjectMetrics({ ...project, phases });
  });
}

function unlockNextPhase(phases: ProjectPhase[], completedPhaseId: string): ProjectPhase[] {
  const completedIndex = phases.findIndex((phase) => phase.phaseId === completedPhaseId);
  return phases.map((phase, index) => {
    if (phase.phaseId === completedPhaseId) {
      return { ...phase, status: "completed" as const, completedAt: nowIso() };
    }
    if (index === completedIndex + 1 && phase.status === "locked") {
      return { ...phase, status: "available" as const };
    }
    return phase;
  });
}

export function completeProjectPhase(
  projectId: string,
  phaseId: string,
  evidenceLabel: string,
  evidenceDescription: string,
): LivingProject | null {
  let result: LivingProject | null = null;

  patchLivingPlatformState((state) => {
    const index = state.projects.findIndex((project) => project.projectId === projectId);
    if (index < 0) return state;

    const project = state.projects[index]!;
    const phase = project.phases.find((item) => item.phaseId === phaseId);
    if (!phase || phase.status === "locked" || phase.status === "completed") return state;

    const evidence = {
      id: createLivingId("pev"),
      label: evidenceLabel,
      description: evidenceDescription,
      attachedAt: nowIso(),
      confirmedAt: nowIso(),
    };

    const phases = unlockNextPhase(
      project.phases.map((item) =>
        item.phaseId === phaseId
          ? { ...item, evidence: [...item.evidence, evidence], paidAmount: item.paidAmount || item.estimatedCost }
          : item,
      ),
      phaseId,
    );

    result = deriveProjectMetrics({ ...project, phases });

    const projects = [...state.projects];
    projects[index] = result;

    return appendLivingActivity({ ...state, projects }, {
      kind: "project",
      title: "Project phase completed",
      detail: `${phase.name} · ${result.progressPercent}% complete`,
    });
  });

  return result;
}

function microActionDetails(microName: string, projectName: string): ActionContractDetails {
  return {
    name: microName,
    purpose: `Project micro-action within ${projectName}.`,
    deliverables: "Phase deliverable per project decomposition.",
    successCriteria: "Verified completion with evidence attached.",
    estimatedDuration: "Per phase schedule",
    evidenceRequirements: "Phase evidence and contract confirmation.",
  };
}

export function contractProjectMicroAction(
  identity: ActivePersonalIdentity,
  projectId: string,
  microActionId: string,
  contractScope: MicroActionContractScope,
): ActionContract | null {
  const project = getProject(projectId);
  if (!project) return null;

  let targetMicro: (typeof project.phases)[0]["subPhases"][0]["microActions"][0] | null = null;
  let parentPhase: ProjectPhase | null = null;

  for (const phase of project.phases) {
    for (const sub of phase.subPhases) {
      const micro = sub.microActions.find((item) => item.microActionId === microActionId);
      if (micro) {
        targetMicro = micro;
        parentPhase = phase;
        break;
      }
    }
    if (targetMicro) break;
  }

  if (!targetMicro || !parentPhase) return null;
  if (parentPhase.status === "locked") return null;

  const team = contractScope === "team" && project.teamId ? getTeam(project.teamId) : null;
  const trackingId = createLivingId("trk").toUpperCase();
  const requestId = createLivingId("req");
  const contractId = createLivingId("ctr");

  const request: ActionServiceRequest = {
    id: requestId,
    trackingId,
    publishedActionId: null,
    opportunityId: `project-${project.projectId}`,
    serviceName: targetMicro.name,
    providerName: team?.name ?? identity.fullName,
    requesterName: identity.fullName,
    requesterPassportKey: passportKey(identity),
    creatorPassportKey: team?.leaderPassportKey ?? passportKey(identity),
    status: "requested",
    progressStep: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const ownerParty = team
    ? {
        passportKey: team.leaderPassportKey,
        fullName: team.name,
        professionalTitle: "Team execution",
        liveFrameTier: team.liveFrameTier,
      }
    : {
        passportKey: passportKey(identity),
        fullName: identity.fullName,
        professionalTitle: identity.professionalTitle,
        photoUrl: identity.photoUrl,
        liveFrameTier: identity.liveFrameTier,
        location: identity.location,
      };

  const contract: ActionContract = {
    contractId,
    requestId,
    trackingId,
    publishedActionId: null,
    opportunityId: request.opportunityId,
    actionOwner: ownerParty,
    requester: {
      passportKey: passportKey(identity),
      fullName: identity.fullName,
      professionalTitle: identity.professionalTitle,
      photoUrl: identity.photoUrl,
      liveFrameTier: identity.liveFrameTier,
      location: identity.location,
    },
    actionDetails: microActionDetails(targetMicro.name, project.name),
    agreementState: "pending_acceptance",
    executionState: "awaiting_acceptance",
    progressStep: 0,
    evidence: [],
    projectId: project.projectId,
    microActionId,
    teamId: team?.teamId ?? null,
    contractScope,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  patchLivingPlatformState((state) => {
    const projectIndex = state.projects.findIndex((item) => item.projectId === projectId);
    if (projectIndex < 0) return state;

    const current = state.projects[projectIndex]!;
    const phases = current.phases.map((phase) => ({
      ...phase,
      subPhases: phase.subPhases.map((sub) => ({
        ...sub,
        microActions: sub.microActions.map((micro) =>
          micro.microActionId === microActionId
            ? {
                ...micro,
                contractId,
                contractScope,
                teamId: team?.teamId ?? null,
                ownerPassportKey: ownerParty.passportKey,
                status: "contracted" as const,
              }
            : micro,
        ),
      })),
    }));

    const projects = [...state.projects];
    projects[projectIndex] = deriveProjectMetrics({ ...current, phases });

    return appendLivingActivity(
      {
        ...state,
        projects,
        requests: [request, ...state.requests],
        contracts: [contract, ...state.contracts],
      },
      {
        kind: "contract",
        title: "Project micro-action contracted",
        detail: `${targetMicro!.name} · ${contractScope} scope`,
      },
    );
  });

  if (contractScope === "individual") {
    acceptActionContract(contractId, identity);
  }

  return contract;
}

export function syncProjectMicroActionFromContract(contractId: string): void {
  const state = readLivingPlatformState();
  const contract = state.contracts.find((item) => item.contractId === contractId);
  if (!contract?.projectId || !contract.microActionId) return;

  updateProject(contract.projectId, (project) => {
    const phases = project.phases.map((phase) => ({
      ...phase,
      subPhases: phase.subPhases.map((sub) => ({
        ...sub,
        microActions: sub.microActions.map((micro) => {
          if (micro.microActionId !== contract.microActionId) return micro;
          let status = micro.status;
          if (contract.agreementState === "completed") status = "completed";
          else if (contract.executionState === "evidence_pending") status = "evidence_pending";
          else if (contract.agreementState === "accepted") status = "in_progress";
          return { ...micro, status, contractId: contract.contractId };
        }),
      })),
    }));
    return deriveProjectMetrics({ ...project, phases });
  });

  if (contract.teamId && contract.agreementState === "completed") {
    recordTeamContractCompletion(contract.teamId);
  }
}
