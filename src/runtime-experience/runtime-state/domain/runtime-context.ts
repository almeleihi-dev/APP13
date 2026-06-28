import type { NeedRequestDraft } from "../../need/domain/need-state.js";

export interface ActiveContractContext {
  contractId?: string;
  actionId?: string;
  route: string;
}

export interface ActiveConversationContext {
  conversationId?: string;
  contractId?: string;
  actionId?: string;
  route: string;
}

export interface ActiveTimelineContext {
  route: string;
  readOnly: true;
}

export interface ActiveNotificationContext {
  route: string;
  readOnly: true;
}

export interface ActiveProfileContext {
  profileId?: string;
  route: string;
  readOnly: true;
}

export interface TransitionProgress {
  stage: string;
  inProgress: boolean;
  route: string;
}

export interface RuntimeApplicationContext {
  needRequest?: NeedRequestDraft;
  contract: ActiveContractContext;
  conversation: ActiveConversationContext;
  timeline: ActiveTimelineContext;
  notification: ActiveNotificationContext;
  profile: ActiveProfileContext;
  transition: TransitionProgress;
  returnDestination: string;
}

export function createInitialRuntimeContext(): RuntimeApplicationContext {
  return {
    contract: { route: "/contract/home" },
    conversation: { route: "/chat/home" },
    timeline: { route: "/timeline/home", readOnly: true },
    notification: { route: "/notification/home", readOnly: true },
    profile: { route: "/profile/home", readOnly: true },
    transition: { stage: "idle", inProgress: false, route: "/system/transition" },
    returnDestination: "/need/home",
  };
}
