import type { AuthContext } from "../../shared/auth/index.js";
import type { DbPool } from "../../shared/db/index.js";
import { notFound } from "../../shared/errors/index.js";
import type { CustomerDashboardService } from "../../customer-experience/application/customer-dashboard-service.js";
import type { ProviderDashboardService } from "../../provider-workspace/application/provider-dashboard-service.js";
import type { EventInboxService } from "../../notifications/application/event-inbox-service.js";
import type { TrustScoreService } from "../../trust/application/trust-score-service.js";
import {
  buildCustomerHomeSummaryFromDashboard,
  buildHomeExperience,
  buildNotificationSummaryFromUnread,
  buildProviderHomeSummaryFromDashboard,
  buildTrustSummaryFromProfile,
  detectHomeMode,
  toCustomerHomeExperienceView,
  toHomeExperienceView,
  toProviderHomeExperienceView,
  type CustomerHomeExperienceView,
  type HomeExperienceView,
  type ProviderHomeExperienceView,
} from "../domain/home-experience.js";
import {
  HomeExperienceRepository,
  homeExperienceRepository,
} from "../infrastructure/home-experience-repository.js";

export class HomeExperienceService {
  private readonly repository: HomeExperienceRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      customerDashboard: CustomerDashboardService;
      providerDashboard: ProviderDashboardService;
      eventInbox: EventInboxService;
      trustScore: TrustScoreService;
    },
    repository?: HomeExperienceRepository
  ) {
    this.repository = repository ?? homeExperienceRepository;
  }

  async getHome(authContext: AuthContext): Promise<HomeExperienceView> {
    const experience = await this.buildHomeExperience(authContext);
    return toHomeExperienceView(experience);
  }

  async getCustomerHome(authContext: AuthContext): Promise<CustomerHomeExperienceView> {
    const snapshot = await this.repository.getUserActivitySnapshot(
      this.db.pool,
      authContext.userId
    );
    if (!snapshot.hasCustomerProfile) {
      throw notFound("Customer profile not found");
    }

    const experience = await this.buildHomeExperience(authContext);
    if (!experience.customer) {
      throw notFound("Customer profile not found");
    }

    return toCustomerHomeExperienceView(experience);
  }

  async getProviderHome(authContext: AuthContext): Promise<ProviderHomeExperienceView> {
    const snapshot = await this.repository.getUserActivitySnapshot(
      this.db.pool,
      authContext.userId
    );
    if (!snapshot.hasProviderProfile) {
      throw notFound("Provider profile not found");
    }

    const experience = await this.buildHomeExperience(authContext);
    if (!experience.provider) {
      throw notFound("Provider profile not found");
    }

    return toProviderHomeExperienceView(experience);
  }

  private async buildHomeExperience(authContext: AuthContext) {
    const snapshot = await this.repository.getUserActivitySnapshot(
      this.db.pool,
      authContext.userId
    );
    const mode = detectHomeMode(snapshot);
    const userId = authContext.userId;

    const [customerDashboard, providerDashboard, unread, trustProfile] = await Promise.all([
      snapshot.hasCustomerProfile
        ? this.deps.customerDashboard
            .getDashboard(userId, userId)
            .catch(() => null)
        : Promise.resolve(null),
      snapshot.hasProviderProfile
        ? this.deps.providerDashboard
            .getDashboard(userId, userId)
            .catch(() => null)
        : Promise.resolve(null),
      this.deps.eventInbox.getUnreadSummary(authContext),
      this.deps.trustScore.getProfileByUserId(userId),
    ]);

    return buildHomeExperience({
      userId,
      mode,
      customer: customerDashboard
        ? buildCustomerHomeSummaryFromDashboard(customerDashboard)
        : null,
      provider: providerDashboard
        ? buildProviderHomeSummaryFromDashboard(providerDashboard)
        : null,
      notifications: buildNotificationSummaryFromUnread(unread),
      trust: buildTrustSummaryFromProfile(userId, trustProfile),
    });
  }
}

export function createHomeExperienceService(
  db: DbPool,
  deps: {
    customerDashboard: CustomerDashboardService;
    providerDashboard: ProviderDashboardService;
    eventInbox: EventInboxService;
    trustScore: TrustScoreService;
  },
  repository?: HomeExperienceRepository
): HomeExperienceService {
  return new HomeExperienceService(db, deps, repository);
}

export function createHomeExperienceModule(
  db: DbPool,
  deps: {
    customerDashboard: CustomerDashboardService;
    providerDashboard: ProviderDashboardService;
    eventInbox: EventInboxService;
    trustScore: TrustScoreService;
    repository?: HomeExperienceRepository;
  }
) {
  const homeExperience = createHomeExperienceService(
    db,
    {
      customerDashboard: deps.customerDashboard,
      providerDashboard: deps.providerDashboard,
      eventInbox: deps.eventInbox,
      trustScore: deps.trustScore,
    },
    deps.repository
  );

  return {
    homeExperience,
  };
}

export type HomeExperienceModule = ReturnType<typeof createHomeExperienceModule>;
