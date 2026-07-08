import { LaunchScene } from "../launch/LaunchScene.js";
import { ActionInventoryExperience } from "../components/action-intelligence/ActionInventoryExperience.js";
import { usePersonalIdentity } from "../passport/usePersonalIdentity.js";
import { useLivingPlatformState } from "../lib/living-platform/useLivingPlatform.js";
import { PremiumButton } from "@an-act/runtime-ui/react";

export interface ActionIntelligencePageProps {
  goal?: string | null;
  onBack: () => void;
}

export function ActionIntelligencePage({ goal, onBack }: ActionIntelligencePageProps) {
  const identity = usePersonalIdentity();
  const livingState = useLivingPlatformState();

  if (!identity) {
    return (
      <LaunchScene className="an-act-action-intelligence-page">
        <div className="an-act-action-intelligence-page__shell">
          <p>Complete your Professional Passport to discover your action inventory.</p>
          <PremiumButton variant="primary" onClick={onBack}>
            Back
          </PremiumButton>
        </div>
      </LaunchScene>
    );
  }

  return (
    <LaunchScene className="an-act-action-intelligence-page">
      <div className="an-act-action-intelligence-page__shell">
        <ActionInventoryExperience identity={identity} livingState={livingState} goal={goal} onBack={onBack} />
      </div>
    </LaunchScene>
  );
}
