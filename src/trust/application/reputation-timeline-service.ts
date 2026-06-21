import type { DbPool } from "../../shared/db/index.js";
import type { TrustEvent } from "../domain/trust-event.js";
import type { ReputationTimeline, ReputationTimelineEntry } from "../domain/reputation-timeline.js";
import { resolveTimelinePresentation } from "../domain/reputation-timeline.js";
import { calculateTrustScore } from "../intelligence/trust-rule-library.js";
import { deriveTrustMetricsFromEvents } from "./trust-service.js";
import { TrustRepository, trustRepository } from "../infrastructure/trust-repository.js";

function scoreFromEvents(events: TrustEvent[]): number {
  if (events.length === 0) return 0;
  const metrics = deriveTrustMetricsFromEvents(events);
  return calculateTrustScore(metrics).trust_score;
}

export function buildReputationTimeline(
  providerId: string,
  events: TrustEvent[]
): ReputationTimeline {
  const ordered = [...events].sort((left, right) => {
    const byOccurred = left.occurredAt.getTime() - right.occurredAt.getTime();
    if (byOccurred !== 0) return byOccurred;
    return left.createdAt.getTime() - right.createdAt.getTime();
  });

  const entries: ReputationTimelineEntry[] = [];
  const prefix: TrustEvent[] = [];

  for (const event of ordered) {
    const scoreBefore = scoreFromEvents(prefix);
    prefix.push(event);
    const scoreAfter = scoreFromEvents(prefix);
    const presentation = resolveTimelinePresentation(event, prefix.slice(0, -1));

    entries.push({
      providerId,
      eventType: event.eventType,
      sourceType: event.sourceEntityType,
      sourceId: event.sourceEntityId,
      occurredAt: event.occurredAt,
      scoreDelta: scoreAfter - scoreBefore,
      scoreAfter,
      severity: presentation.severity,
      title: presentation.title,
      description: presentation.description,
    });
  }

  return {
    providerId,
    entries,
    currentScore: scoreFromEvents(ordered),
  };
}

export class ReputationTimelineService {
  constructor(
    private readonly db: DbPool,
    private readonly repository: TrustRepository = trustRepository
  ) {}

  async getProviderTimeline(providerId: string): Promise<ReputationTimeline> {
    const events = await this.repository.listEventsByProvider(this.db.pool, providerId);
    return buildReputationTimeline(providerId, events);
  }
}

export function createReputationTimelineService(
  db: DbPool,
  repository: TrustRepository = trustRepository
): ReputationTimelineService {
  return new ReputationTimelineService(db, repository);
}
