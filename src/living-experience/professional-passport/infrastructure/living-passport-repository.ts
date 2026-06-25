import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import type { LivingProfessionalPassport } from "../domain/passport-experience.js";
import type { PartnerShareRequest } from "../domain/passport-sections.js";
import type { PartnerType } from "../domain/passport-schema.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";

export interface PartnerApprovalRecord {
  partnerType: PartnerType;
  partnerName: string;
  approved: boolean;
  approvedAt: string | null;
}

export class LivingPassportRepository {
  private readonly passports = new Map<string, LivingProfessionalPassport>();
  private readonly partnerApprovals = new Map<string, PartnerApprovalRecord[]>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    const state = livingOnboardingRepository().getOrCreate(userId);
    return { ...state.responses };
  }

  getCachedPassport(userId: string, dayKey: string): LivingProfessionalPassport | undefined {
    const cached = this.passports.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  savePassport(userId: string, passport: LivingProfessionalPassport): void {
    this.passports.set(userId, passport);
  }

  listPassports(): LivingProfessionalPassport[] {
    return [...this.passports.values()];
  }

  getApprovedPartners(userId: string): PartnerShareRequest[] {
    return (this.partnerApprovals.get(userId) ?? []).map((p) => ({ ...p }));
  }

  approvePartner(
    userId: string,
    input: { partner_type: PartnerType; partner_name: string }
  ): PartnerApprovalRecord[] {
    const existing = this.partnerApprovals.get(userId) ?? [];
    const found = existing.find(
      (p) => p.partnerType === input.partner_type && p.partnerName === input.partner_name
    );

    if (found) {
      found.approved = true;
      found.approvedAt = new Date().toISOString();
    } else {
      existing.push({
        partnerType: input.partner_type,
        partnerName: input.partner_name,
        approved: true,
        approvedAt: new Date().toISOString(),
      });
    }

    this.partnerApprovals.set(userId, existing);
    return existing.map((p) => ({ ...p }));
  }

  revokePartner(
    userId: string,
    input: { partner_type: PartnerType; partner_name: string }
  ): PartnerApprovalRecord[] {
    const existing = this.partnerApprovals.get(userId) ?? [];
    const updated = existing.filter(
      (p) => !(p.partnerType === input.partner_type && p.partnerName === input.partner_name)
    );
    this.partnerApprovals.set(userId, updated);
    return updated.map((p) => ({ ...p }));
  }

  countApprovedPartners(): number {
    let count = 0;
    for (const partners of this.partnerApprovals.values()) {
      count += partners.filter((p) => p.approved).length;
    }
    return count;
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }
}

let defaultRepository: LivingPassportRepository | undefined;

export function createLivingPassportRepository(): LivingPassportRepository {
  return new LivingPassportRepository();
}

export function livingPassportRepository(): LivingPassportRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingPassportRepository();
  }
  return defaultRepository;
}
