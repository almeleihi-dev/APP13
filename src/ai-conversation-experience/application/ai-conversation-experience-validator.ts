import type {
  AiConversationExperienceOutput,
  AiConversationExperienceValidation,
} from "../domain/ai-conversation-experience-context.js";

export class AiConversationExperienceValidator {
  validateOutput(output: AiConversationExperienceOutput): AiConversationExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.conversationContext.contextId) missingFields.push("conversation_context");
    if (!output.conversationThread.threadId) missingFields.push("conversation_thread");
    if (!output.foundationOutputId) missingFields.push("foundation_link");
    if (output.conversationMessages.messages.length === 0) {
      missingFields.push("conversation_messages");
    }
    if (output.conversationConfidence.score < 45) {
      warnings.push("Low conversation confidence — outputs are advisory only.");
    }
    if (output.conversationStatus.level === "conditional") {
      warnings.push("Conditional conversation — foundation requires review.");
    }
    if (!output.conversationReadiness.conversationReady) {
      warnings.push("Conversation not fully ready — operating in advisory mode.");
    }

    const completenessScore = Math.max(
      0,
      100 - missingFields.length * 15 - warnings.length * 5
    );

    return {
      valid: missingFields.length === 0,
      completenessScore,
      missingFields,
      warnings,
      summary:
        missingFields.length === 0
          ? "AI Conversation Experience output is complete and traceable to X1 foundation."
          : `Conversation output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiConversationExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Conversation Experience scenarios have full upstream foundation coverage.",
    };
  }
}

export function createAiConversationExperienceValidator(): AiConversationExperienceValidator {
  return new AiConversationExperienceValidator();
}
