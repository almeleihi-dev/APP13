import { PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import {
  beginGuestPassportConversion,
  GUEST_PASSPORT_VALUE_POINTS,
  type GuestRestrictedAction,
  GUEST_RESTRICTION_MESSAGES,
} from "../../guest/guest-conversion.js";

export interface GuestConversionPromptProps {
  action: GuestRestrictedAction;
  onDismiss?: () => void;
}

export function GuestConversionPrompt({ action, onDismiss }: GuestConversionPromptProps) {
  return (
    <PremiumCard featured className="an-act-guest-conversion">
      <p className="an-act-guest-conversion__badge">Guest Preview</p>
      <h3 className="an-act-guest-conversion__title">{GUEST_RESTRICTION_MESSAGES[action]}</h3>
      <p className="an-act-guest-conversion__lead">
        Trust requires identity. Contracts require passport. Create your Professional Passport to make this real.
      </p>
      <ul className="an-act-guest-conversion__list">
        {GUEST_PASSPORT_VALUE_POINTS.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <div className="an-act-guest-conversion__actions">
        <PremiumButton variant="primary" onClick={beginGuestPassportConversion}>
          Create your Professional Passport
        </PremiumButton>
        {onDismiss ? (
          <PremiumButton variant="ghost" onClick={onDismiss}>
            Keep exploring as Guest
          </PremiumButton>
        ) : null}
      </div>
    </PremiumCard>
  );
}
