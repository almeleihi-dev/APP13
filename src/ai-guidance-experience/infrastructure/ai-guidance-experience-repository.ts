import type { AuthContext } from "../../shared/auth/index.js";
import type { AiConversationExperienceService } from "../../ai-conversation-experience/application/ai-conversation-experience-service.js";
import type { AiConversationExperienceQuery } from "../../ai-conversation-experience/application/ai-conversation-experience-service.js";
import { createAiConversationExperienceService } from "../../ai-conversation-experience/application/ai-conversation-experience-service.js";
import type { AiConversationExperienceOutput } from "../../ai-conversation-experience/domain/ai-conversation-experience-context.js";
import type { AiGuidanceExperienceContext } from "../domain/ai-guidance-experience-context.js";

export interface UpstreamGuidanceInputs {
  conversation: AiConversationExperienceOutput;
}

export class AiGuidanceExperienceRepository {
  private readonly aiConversationExperience: AiConversationExperienceService;

  constructor(deps?: { aiConversationExperience?: AiConversationExperienceService }) {
    this.aiConversationExperience =
      deps?.aiConversationExperience ?? createAiConversationExperienceService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiGuidanceExperienceContext,
    query: AiConversationExperienceQuery
  ): UpstreamGuidanceInputs {
    const conversation = this.aiConversationExperience.buildOutputForValidation(
      authContext,
      query
    );
    return { conversation };
  }
}

export function createAiGuidanceExperienceRepository(
  deps?: ConstructorParameters<typeof AiGuidanceExperienceRepository>[0]
): AiGuidanceExperienceRepository {
  return new AiGuidanceExperienceRepository(deps);
}
