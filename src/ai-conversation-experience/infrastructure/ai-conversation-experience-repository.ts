import type { AuthContext } from "../../shared/auth/index.js";
import type { AiExperienceFoundationService } from "../../ai-experience/application/ai-experience-foundation-service.js";
import type { AiExperienceFoundationQuery } from "../../ai-experience/application/ai-experience-foundation-service.js";
import { createAiExperienceFoundationService } from "../../ai-experience/application/ai-experience-foundation-service.js";
import type { AiExperienceFoundationOutput } from "../../ai-experience/domain/ai-experience-foundation-context.js";
import type { AiConversationExperienceContext } from "../domain/ai-conversation-experience-context.js";

export interface UpstreamConversationInputs {
  foundation: AiExperienceFoundationOutput;
}

export class AiConversationExperienceRepository {
  private readonly aiExperienceFoundation: AiExperienceFoundationService;

  constructor(deps?: { aiExperienceFoundation?: AiExperienceFoundationService }) {
    this.aiExperienceFoundation =
      deps?.aiExperienceFoundation ?? createAiExperienceFoundationService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiConversationExperienceContext,
    query: AiExperienceFoundationQuery
  ): UpstreamConversationInputs {
    const foundation = this.aiExperienceFoundation.buildOutputForValidation(authContext, query);
    return { foundation };
  }
}

export function createAiConversationExperienceRepository(
  deps?: ConstructorParameters<typeof AiConversationExperienceRepository>[0]
): AiConversationExperienceRepository {
  return new AiConversationExperienceRepository(deps);
}
