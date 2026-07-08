import { ProfessionalPassportMiniPreview } from "@an-act/runtime-ui/react";
import type { TeamPassport } from "../../lib/living-platform/types.js";

export interface TeamPassportCardProps {
  team: TeamPassport;
  onJoin?: () => void;
  compact?: boolean;
}

export function TeamPassportCard({ team, onJoin, compact = false }: TeamPassportCardProps) {
  const leader = team.members.find((member) => member.passportKey === team.leaderPassportKey);

  return (
    <article className={`an-act-team-passport ${compact ? "an-act-team-passport--compact" : ""}`}>
      <header className="an-act-team-passport__header">
        <div>
          <p className="ds-eyebrow">Team Passport</p>
          <h3 className="ds-title">{team.name}</h3>
          <p className="ds-caption">Team ID · {team.teamId}</p>
        </div>
        <span className={`ds-badge ds-badge--live-frame ds-badge--live-frame-${team.liveFrameTier}`}>
          Team Live Frame · {team.liveFrameTier}
        </span>
      </header>

      <div className="an-act-team-passport__stats">
        <div>
          <span className="ds-caption">Trust</span>
          <strong className="ds-title">{team.trustScore}%</strong>
        </div>
        <div>
          <span className="ds-caption">Reliability</span>
          <strong className="ds-title">{team.reliabilityScore}%</strong>
        </div>
        <div>
          <span className="ds-caption">Completed</span>
          <strong className="ds-title">{team.completedActions}</strong>
        </div>
        <div>
          <span className="ds-caption">Members</span>
          <strong className="ds-title">{team.members.length}</strong>
        </div>
      </div>

      {leader ? (
        <div className="an-act-team-passport__leader">
          <ProfessionalPassportMiniPreview
            profile={{
              providerName: leader.fullName,
              serviceName: leader.professionalTitle ?? "Team leader",
              liveFrameTier: team.liveFrameTier,
              avatarInitials: leader.fullName.slice(0, 2).toUpperCase(),
              photoUrl: leader.photoUrl,
              summary: `${team.name} · Team leader`,
              rating: `${team.trustScore}%`,
              certifications: team.trustIndicators.slice(0, 3),
            }}
          />
        </div>
      ) : null}

          {!compact ? (
        <>
          <div className="an-act-team-passport__global">
            <p className="ds-eyebrow">Global capability</p>
            <p className="ds-caption">
              Languages: {team.globalCapability.languagesSpoken.join(", ")}
            </p>
            <p className="ds-caption">
              Available: {team.globalCapability.teamLocations.join(" + ") || "Remote"} ·{" "}
              {team.globalCapability.coverage.join(", ")}
            </p>
          </div>

          <div className="an-act-team-passport__skills">
            <p className="ds-eyebrow">Combined skills</p>
            <div className="an-act-team-passport__chip-row">
              {team.combinedSkills.slice(0, 8).map((skill) => (
                <span key={skill} className="ds-chip">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="an-act-team-passport__members">
            <p className="ds-eyebrow">Members</p>
            <ul className="an-act-team-passport__member-list">
              {team.members.map((member) => (
                <li key={member.passportKey}>
                  <strong>{member.fullName}</strong>
                  <span>{member.role}</span>
                </li>
              ))}
            </ul>
          </div>

          {team.trustIndicators.length > 0 ? (
            <div className="an-act-team-passport__indicators">
              {team.trustIndicators.map((indicator) => (
                <span key={indicator} className="ds-badge ds-badge--trust">
                  {indicator}
                </span>
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {onJoin ? (
        <button type="button" className="ds-btn ds-btn--secondary ds-btn--block" onClick={onJoin}>
          Join team
        </button>
      ) : null}
    </article>
  );
}
