import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** Mirrors RuntimeProvider transition guard rules. */
function isHydratedTransitionEnvelope(envelope: {
  current_screen?: string;
  screen?: { screenId?: string };
}): boolean {
  return envelope.current_screen === "transition" || envelope.screen?.screenId === "transition";
}

const INTENTIONAL_TRANSITION_CALLERS = [
  "runTransitionSequence",
  "relay:need.continue-request",
  "relay:need.advance-transition",
  "relay:action.return",
  "returnToNeed",
  "runActionReturnTransitionSequence",
] as const;

function isIntentionalTransitionApply(caller: string): boolean {
  return INTENTIONAL_TRANSITION_CALLERS.some((token) => caller.includes(token));
}

function shouldBlockTransitionApply(caller: string, envelope: { current_screen?: string; screen?: { screenId?: string } }) {
  return isHydratedTransitionEnvelope(envelope) && !isIntentionalTransitionApply(caller);
}

describe("runtime mutation guard", () => {
  it("blocks stale server transition from reloadNeedExperience", () => {
    const stale = {
      current_screen: "transition",
      screen: { screenId: "transition" },
      mode: "action",
    };
    assert.equal(shouldBlockTransitionApply("reloadNeedExperience>hydrateNeedEnvelope", stale), true);
  });

  it("blocks relay envelope misclassified by mode action", () => {
    const stale = {
      current_screen: "transition",
      screen: { screenId: "transition" },
      mode: "action",
    };
    assert.equal(shouldBlockTransitionApply("relay:envelope:unknown", stale), true);
  });

  it("allows intentional need.continue-request transition", () => {
    const active = {
      current_screen: "transition",
      screen: { screenId: "transition" },
      mode: "transition",
    };
    assert.equal(shouldBlockTransitionApply("relay:need.continue-request", active), false);
  });

  it("allows runTransitionSequence mid-flight updates", () => {
    const active = {
      current_screen: "transition",
      screen: { screenId: "transition" },
      mode: "transition",
    };
    assert.equal(shouldBlockTransitionApply("runTransitionSequence", active), false);
  });
});
