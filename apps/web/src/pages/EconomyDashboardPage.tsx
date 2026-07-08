import { LaunchScene } from "../launch/LaunchScene.js";
import { EconomyDashboardExperience } from "../components/economy-living/EconomyDashboardExperience.js";
import { PlatformIdentityNavChip } from "../passport/PlatformIdentityNavChip.js";
import { usePersonalIdentity } from "../passport/usePersonalIdentity.js";
import { PUBLIC_BETA_LABEL, PUBLIC_BETA_MODE } from "../lib/public-beta.js";

export interface EconomyDashboardPageProps {
  onBack: () => void;
}

export function EconomyDashboardPage({ onBack }: EconomyDashboardPageProps) {
  const identity = usePersonalIdentity();

  if (!identity) {
    return (
      <LaunchScene className="an-act-economy-page">
        <p className="ds-body">Complete your Professional Passport to view the contract economy.</p>
        <button type="button" className="ds-btn ds-btn--primary" onClick={onBack}>
          Back
        </button>
      </LaunchScene>
    );
  }

  return (
    <LaunchScene className="an-act-economy-page an-act-living-s4">
      <div className="an-act-economy-page__shell">
        <header className="an-act-economy-page__nav">
          <PlatformIdentityNavChip identity={identity} />
          {PUBLIC_BETA_MODE ? <span className="ds-flow__sample-badge">{PUBLIC_BETA_LABEL}</span> : null}
        </header>
        <EconomyDashboardExperience onBack={onBack} />
      </div>
    </LaunchScene>
  );
}
