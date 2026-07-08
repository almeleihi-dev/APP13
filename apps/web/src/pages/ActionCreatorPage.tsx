import { AnActLogoKey, PremiumLiveIndicator } from "@an-act/runtime-ui/react";
import { LaunchScene } from "../launch/LaunchScene.js";
import { ActionCreatorFlow } from "../components/action-creator/ActionCreatorFlow.js";
import { PlatformIdentityNavChip } from "../passport/PlatformIdentityNavChip.js";
import { usePersonalIdentity } from "../passport/usePersonalIdentity.js";
import { PUBLIC_BETA_LABEL, PUBLIC_BETA_MODE } from "../lib/public-beta.js";

export interface ActionCreatorPageProps {
  onComplete: () => void;
  onCancel: () => void;
  onViewMarketplace?: () => void;
}

export function ActionCreatorPage({ onComplete, onCancel, onViewMarketplace }: ActionCreatorPageProps) {
  const identity = usePersonalIdentity();

  return (
    <LaunchScene className="an-act-action-creator an-act-platform-continuity an-act-sig-os">
      <div className="an-act-action-creator__shell an-act-excellence-s1-page an-act-sig-enter">
        <header className="an-act-action-creator__topbar">
          <AnActLogoKey size="sm" />
          <div className="an-act-action-creator__topbar-status">
            {identity ? <PlatformIdentityNavChip identity={identity} /> : null}
            <PremiumLiveIndicator label={PUBLIC_BETA_MODE ? PUBLIC_BETA_LABEL : "Action Creator"} />
          </div>
        </header>

        {PUBLIC_BETA_MODE ? (
          <p className="an-act-public-beta-notice an-act-action-creator__beta-notice" role="status">
            <strong>Functional Beta Sprint 1.</strong> Publish attaches your Professional Passport to a marketplace
            listing. Actions persist locally in this browser during public beta.
          </p>
        ) : null}

        <ActionCreatorFlow
          identity={identity}
          onComplete={onComplete}
          onCancel={onCancel}
          onViewMarketplace={onViewMarketplace}
        />
      </div>
    </LaunchScene>
  );
}
