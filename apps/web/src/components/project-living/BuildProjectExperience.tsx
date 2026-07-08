import { useMemo, useState } from "react";
import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";
import type { LivingProject, ProjectExecutionPath } from "../../lib/living-platform/types.js";
import {
  PROJECT_PATH_DESCRIPTIONS,
  PROJECT_PATH_LABELS,
} from "../../lib/living-platform/types.js";
import {
  completeProjectPhase,
  contractProjectMicroAction,
  createProjectFromGoal,
  getProject,
  payProjectPhase,
} from "../../lib/living-platform/project-living-store.js";
import { listTeamsForMember } from "../../lib/living-platform/team-passport-store.js";
import { useLivingPlatformState } from "../../lib/living-platform/useLivingPlatform.js";
import { TeamPassportCard } from "../team-living/TeamPassportCard.js";

export type BuildProjectStage = "goal" | "path" | "review" | "live";

export interface BuildProjectExperienceProps {
  identity: ActivePersonalIdentity;
  initialProjectId?: string | null;
  onComplete: () => void;
  onCancel: () => void;
}

export function BuildProjectExperience({
  identity,
  initialProjectId,
  onComplete,
  onCancel,
}: BuildProjectExperienceProps) {
  const livingState = useLivingPlatformState();
  const teams = useMemo(() => listTeamsForMember(identity), [identity, livingState.teams]);
  const [stage, setStage] = useState<BuildProjectStage>(initialProjectId ? "live" : "goal");
  const [goal, setGoal] = useState("");
  const [selectedPath, setSelectedPath] = useState<ProjectExecutionPath>("step_by_step");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.teamId ?? null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialProjectId ?? null);
  const [evidenceLabel, setEvidenceLabel] = useState("Phase delivery confirmation");
  const [evidenceDescription, setEvidenceDescription] = useState("");

  const project = activeProjectId ? getProject(activeProjectId) : null;
  void livingState.projects;

  function handleDecompose() {
    if (!goal.trim()) return;
    const created = createProjectFromGoal(identity, goal, selectedPath, selectedTeamId);
    setActiveProjectId(created.projectId);
    setStage("review");
  }

  function handlePayPhase(phaseId: string) {
    if (!activeProjectId) return;
    payProjectPhase(activeProjectId, phaseId);
  }

  function handleCompletePhase(phaseId: string) {
    if (!activeProjectId || !evidenceLabel.trim()) return;
    completeProjectPhase(activeProjectId, phaseId, evidenceLabel, evidenceDescription);
    setEvidenceDescription("");
  }

  function handleContractMicro(microActionId: string, scope: "individual" | "team") {
    if (!activeProjectId) return;
    contractProjectMicroAction(identity, activeProjectId, microActionId, scope);
  }

  return (
    <div className="an-act-build-project ds-flow">
      <header className="an-act-build-project__header">
        <button type="button" className="ds-btn ds-btn--ghost" onClick={onCancel}>
          ← Back to Personal Home
        </button>
        <span className="ds-flow__sample-badge">Build Project · Living decomposition</span>
        <h1 className="ds-headline">Build Project</h1>
        <p className="ds-body">
          A project is a living structure of phases — every phase is made of contracted actions connected to trust
          growth.
        </p>
      </header>

      {stage === "goal" ? (
        <section className="ds-card ds-card--premium">
          <h2 className="ds-title">Project goal</h2>
          <p className="ds-caption">Describe what you want to achieve. The system decomposes it into phases and micro-actions.</p>
          <textarea
            className="ds-input ds-input--textarea"
            rows={4}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder='e.g. "I want to build a house" · "I want to launch an app" · "I want to open a business"'
          />
          {teams.length > 0 ? (
            <label className="an-act-build-project__field">
              <span className="ds-eyebrow">Team (optional)</span>
              <select
                className="ds-input"
                value={selectedTeamId ?? ""}
                onChange={(event) => setSelectedTeamId(event.target.value || null)}
              >
                <option value="">Individual execution</option>
                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button
            type="button"
            className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block ds-btn--ripple"
            disabled={!goal.trim()}
            onClick={() => setStage("path")}
          >
            Choose execution path
          </button>
        </section>
      ) : null}

      {stage === "path" ? (
        <section className="an-act-build-project__paths">
          <h2 className="ds-title">Execution path</h2>
          <p className="ds-caption">You do not need full project funding to start — pay phase by phase on the Step-by-Step path.</p>
          {(["fast", "balanced", "step_by_step"] as ProjectExecutionPath[]).map((path) => (
            <button
              key={path}
              type="button"
              className={`ds-card ds-card--glass an-act-build-project__path ${selectedPath === path ? "an-act-build-project__path--active" : ""}`}
              onClick={() => setSelectedPath(path)}
            >
              <strong className="ds-title">{PROJECT_PATH_LABELS[path]}</strong>
              <p className="ds-caption">{PROJECT_PATH_DESCRIPTIONS[path]}</p>
            </button>
          ))}
          <div className="ds-action-bar">
            <button type="button" className="ds-btn ds-btn--ghost" onClick={() => setStage("goal")}>
              Back
            </button>
            <button type="button" className="ds-btn ds-btn--primary ds-btn--lg ds-btn--ripple" onClick={handleDecompose}>
              Decompose project
            </button>
          </div>
        </section>
      ) : null}

      {(stage === "review" || stage === "live") && project ? (
        <ProjectLiveFramePanel
          project={project}
          evidenceLabel={evidenceLabel}
          evidenceDescription={evidenceDescription}
          onEvidenceLabelChange={setEvidenceLabel}
          onEvidenceDescriptionChange={setEvidenceDescription}
          onPayPhase={handlePayPhase}
          onCompletePhase={handleCompletePhase}
          onContractMicro={handleContractMicro}
          onActivate={() => setStage("live")}
          showActivate={stage === "review"}
        />
      ) : null}

      {stage === "live" && project ? (
        <div className="ds-action-bar">
          <button type="button" className="ds-btn ds-btn--primary ds-btn--block" onClick={onComplete}>
            Return to Personal Home
          </button>
        </div>
      ) : null}

      {stage === "review" && project ? (
        <div className="ds-action-bar">
          <button type="button" className="ds-btn ds-btn--primary ds-btn--block" onClick={() => setStage("live")}>
            Start project execution
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ProjectLiveFramePanel({
  project,
  evidenceLabel,
  evidenceDescription,
  onEvidenceLabelChange,
  onEvidenceDescriptionChange,
  onPayPhase,
  onCompletePhase,
  onContractMicro,
  onActivate,
  showActivate,
}: {
  project: LivingProject;
  evidenceLabel: string;
  evidenceDescription: string;
  onEvidenceLabelChange: (value: string) => void;
  onEvidenceDescriptionChange: (value: string) => void;
  onPayPhase: (phaseId: string) => void;
  onCompletePhase: (phaseId: string) => void;
  onContractMicro: (microActionId: string, scope: "individual" | "team") => void;
  onActivate: () => void;
  showActivate: boolean;
}) {
  return (
    <div className="an-act-project-live-frame">
      <section className="ds-card ds-card--premium an-act-project-live-frame__passport">
        <p className="ds-eyebrow">Project Passport · Live Frame</p>
        <h2 className="ds-headline">{project.name}</h2>
        <p className="ds-caption">{project.goal}</p>
        <div className="an-act-project-live-frame__metrics">
          <Metric label="Health" value={project.liveFrameHealth} />
          <Metric label="Progress" value={`${project.progressPercent}%`} />
          <Metric label="Trust" value={`${project.trustLevel}%`} />
          <Metric label="Status" value={project.executionStatus} />
          <Metric label="Phases done" value={`${project.completedPhaseCount}/${project.phases.length}`} />
          <Metric label="Active contracts" value={String(project.activeContractIds.length)} />
        </div>
        {project.riskIndicators.length > 0 ? (
          <div className="an-act-project-live-frame__risks">
            {project.riskIndicators.map((risk) => (
              <span key={risk} className="ds-badge ds-badge--warning">
                {risk}
              </span>
            ))}
          </div>
        ) : null}
        {showActivate ? (
          <button type="button" className="ds-btn ds-btn--secondary ds-btn--block" onClick={onActivate}>
            Open live execution view
          </button>
        ) : null}
      </section>

      <section className="an-act-project-live-frame__phases">
        <h3 className="ds-title">Project decomposition</h3>
        <p className="ds-caption">Project → Phases → Sub-phases → Micro Actions → Contracts → Evidence → Trust</p>
        {project.phases.map((phase) => (
          <article key={phase.phaseId} className={`ds-card an-act-project-live-frame__phase an-act-project-live-frame__phase--${phase.status}`}>
            <header>
              <strong className="ds-title">{phase.name}</strong>
              <span className="ds-badge">{phase.status}</span>
              <span className="ds-caption">
                ${phase.estimatedCost.toLocaleString()} · {phase.estimatedDays} days
              </span>
            </header>

            {phase.status === "available" || phase.status === "in_progress" ? (
              <div className="an-act-project-live-frame__phase-actions">
                <button type="button" className="ds-btn ds-btn--secondary ds-btn--sm" onClick={() => onPayPhase(phase.phaseId)}>
                  Pay phase
                </button>
                {phase.status === "in_progress" ? (
                  <>
                    <input
                      className="ds-input"
                      value={evidenceLabel}
                      onChange={(event) => onEvidenceLabelChange(event.target.value)}
                      placeholder="Evidence label"
                    />
                    <input
                      className="ds-input"
                      value={evidenceDescription}
                      onChange={(event) => onEvidenceDescriptionChange(event.target.value)}
                      placeholder="Evidence description"
                    />
                    <button
                      type="button"
                      className="ds-btn ds-btn--primary ds-btn--sm"
                      onClick={() => onCompletePhase(phase.phaseId)}
                    >
                      Complete phase · unlock next
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}

            {phase.subPhases.map((sub) => (
              <div key={sub.subPhaseId} className="an-act-project-live-frame__subphase">
                <p className="ds-eyebrow">{sub.name}</p>
                <ul className="an-act-project-live-frame__micro-list">
                  {sub.microActions.map((micro) => (
                    <li key={micro.microActionId}>
                      <div>
                        <strong>{micro.name}</strong>
                        <span className="ds-caption">
                          ${micro.estimatedCost.toLocaleString()} · {micro.estimatedDays}d · {micro.status}
                        </span>
                      </div>
                      {phase.status !== "locked" && phase.status !== "completed" && !micro.contractId ? (
                        <div className="an-act-project-live-frame__micro-actions">
                          <button
                            type="button"
                            className="ds-btn ds-btn--ghost ds-btn--sm"
                            onClick={() => onContractMicro(micro.microActionId, "individual")}
                          >
                            Individual contract
                          </button>
                          {project.teamId ? (
                            <button
                              type="button"
                              className="ds-btn ds-btn--ghost ds-btn--sm"
                              onClick={() => onContractMicro(micro.microActionId, "team")}
                            >
                              Team contract
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                      {micro.contractId ? (
                        <span className="ds-badge ds-badge--trust">Contract · {micro.contractId.slice(0, 12)}…</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        ))}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="an-act-project-live-frame__metric">
      <span className="ds-caption">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function TeamPassportSection({
  identity,
  onCreateTeam,
}: {
  identity: ActivePersonalIdentity;
  onCreateTeam: (name: string) => void;
}) {
  const teams = listTeamsForMember(identity);
  const [teamName, setTeamName] = useState("");

  return (
    <section className="an-act-team-passport-section">
      <div className="an-act-team-passport-section__create">
        <input
          className="ds-input"
          value={teamName}
          onChange={(event) => setTeamName(event.target.value)}
          placeholder="New team name"
        />
        <button
          type="button"
          className="ds-btn ds-btn--secondary"
          onClick={() => {
            if (teamName.trim()) {
              onCreateTeam(teamName.trim());
              setTeamName("");
            }
          }}
        >
          Create team
        </button>
      </div>
      <div className="an-act-team-passport-section__grid">
        {teams.map((team) => (
          <TeamPassportCard key={team.teamId} team={team} />
        ))}
      </div>
    </section>
  );
}
