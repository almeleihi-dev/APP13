import { LaunchScene } from "../launch/LaunchScene.js";
import { PlatformIdentityNavChip } from "../passport/PlatformIdentityNavChip.js";
import { usePersonalIdentity } from "../passport/usePersonalIdentity.js";
import { BuildProjectExperience } from "../components/project-living/BuildProjectExperience.js";
import { PUBLIC_BETA_LABEL, PUBLIC_BETA_MODE } from "../lib/public-beta.js";

export interface BuildProjectPageProps {
  initialProjectId?: string | null;
  onComplete: () => void;
  onCancel: () => void;
}

export function BuildProjectPage({ initialProjectId, onComplete, onCancel }: BuildProjectPageProps) {
  const identity = usePersonalIdentity();

  if (!identity) {
    return (
      <LaunchScene className="an-act-build-project-page">
        <p className="ds-body">Complete your Professional Passport to build projects.</p>
        <button type="button" className="ds-btn ds-btn--primary" onClick={onCancel}>
          Back
        </button>
      </LaunchScene>
    );
  }

  return (
    <LaunchScene className="an-act-build-project-page an-act-living-s3">
      <div className="an-act-build-project-page__shell">
        <header className="an-act-build-project-page__nav">
          <PlatformIdentityNavChip identity={identity} />
          {PUBLIC_BETA_MODE ? <span className="ds-flow__sample-badge">{PUBLIC_BETA_LABEL}</span> : null}
        </header>
        <BuildProjectExperience
          identity={identity}
          initialProjectId={initialProjectId}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      </div>
    </LaunchScene>
  );
}
