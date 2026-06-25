import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingPartnerEcosystemExperience } from "../domain/partner-experience.js";
import type { ConnectedPartner, PermissionHistoryEntry } from "../domain/partner-sections.js";
import type { ConnectionStatus } from "../domain/partner-schema.js";

export interface UserPartnerConnections {
  approved: ConnectedPartner[];
  pending: ConnectedPartner[];
  expired: ConnectedPartner[];
  permissionHistory: PermissionHistoryEntry[];
}

export class LivingPartnerEcosystemRepository {
  private readonly experiences = new Map<string, LivingPartnerEcosystemExperience>();
  private readonly connections = new Map<string, UserPartnerConnections>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingPartnerEcosystemExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingPartnerEcosystemExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingPartnerEcosystemExperience[] {
    return [...this.experiences.values()];
  }

  getConnections(userId: string): UserPartnerConnections {
    return (
      this.connections.get(userId) ?? {
        approved: [],
        pending: [],
        expired: [],
        permissionHistory: [],
      }
    );
  }

  requestConnection(
    userId: string,
    input: { partnerId: string; name: string; category: string; userPermissionGranted: boolean },
    recordedAt: string
  ): { connected: ConnectedPartner | null; message: string } {
    const state = this.getConnections(userId);

    this.recordPermission(userId, input.partnerId, "connection_requested", recordedAt);

    if (!input.userPermissionGranted) {
      return {
        connected: null,
        message: "User permission required before initiating partner connection.",
      };
    }

    const without = state.pending.filter((p) => p.partnerId !== input.partnerId);
    const pending: ConnectedPartner = {
      partnerId: input.partnerId,
      name: input.name,
      category: input.category,
      status: "pending" as ConnectionStatus,
      connectedAt: recordedAt,
    };

    this.connections.set(userId, {
      ...state,
      pending: [pending, ...without],
      permissionHistory: [
        { partnerId: input.partnerId, action: "connection_initiated", recordedAt, userInitiated: true as const },
        ...state.permissionHistory,
      ],
    });

    return {
      connected: pending,
      message: "Connection request recorded — partner executes outside APP13.",
    };
  }

  recordPermission(userId: string, partnerId: string, action: string, recordedAt: string): void {
    const state = this.getConnections(userId);
    this.connections.set(userId, {
      ...state,
      permissionHistory: [
        { partnerId, action, recordedAt, userInitiated: true as const },
        ...state.permissionHistory,
      ].slice(0, 50),
    });
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  getTotalConnectedCount(): number {
    let count = 0;
    for (const state of this.connections.values()) {
      count += state.approved.length;
    }
    return count;
  }

  getTotalPendingCount(): number {
    let count = 0;
    for (const state of this.connections.values()) {
      count += state.pending.length;
    }
    return count;
  }
}

let defaultRepository: LivingPartnerEcosystemRepository | undefined;

export function createLivingPartnerEcosystemRepository(): LivingPartnerEcosystemRepository {
  return new LivingPartnerEcosystemRepository();
}

export function livingPartnerEcosystemRepository(): LivingPartnerEcosystemRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingPartnerEcosystemRepository();
  }
  return defaultRepository;
}
