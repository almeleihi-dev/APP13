import type { Queryable } from "../../../shared/db/index.js";
import {
  CustomerDashboardRepository,
  customerDashboardRepository,
} from "../../../customer-experience/infrastructure/customer-dashboard-repository.js";
import {
  DiscoveryMatchingRepository,
  discoveryMatchingRepository,
} from "../../discovery-matching/infrastructure/discovery-matching-repository.js";
import {
  deriveRecommendationRequirement,
  type CustomerCommandCenterRawSnapshot,
} from "../domain/customer-command-center.js";

export class CustomerCommandCenterRepository {
  constructor(
    private readonly dashboardRepository: CustomerDashboardRepository = customerDashboardRepository,
    private readonly discoveryRepository: DiscoveryMatchingRepository = discoveryMatchingRepository
  ) {}

  async loadRawSnapshot(
    client: Queryable,
    customerUserId: string
  ): Promise<CustomerCommandCenterRawSnapshot | null> {
    const customer = await this.dashboardRepository.findCustomerByUserId(client, customerUserId);
    if (!customer) return null;

    const [requests, offerCounts, offers, contracts, discoverySnapshot] = await Promise.all([
      this.dashboardRepository.listRequestsByCustomerUserId(client, customerUserId),
      this.dashboardRepository.countOffersByRequest(client, customerUserId),
      this.dashboardRepository.listOffersByCustomerUserId(client, customerUserId),
      this.dashboardRepository.listContractsByCustomerUserId(client, customerUserId),
      this.discoveryRepository.loadSnapshot(client),
    ]);

    const contractIds = contracts.map((contract) => contract.id);
    const escrows = await this.dashboardRepository.listEscrowsByContractIds(client, contractIds);
    const { requirement, primaryRequestId } = deriveRecommendationRequirement({ requests });

    return {
      customerUserId,
      customerId: customer.id,
      displayName: customer.displayName,
      requests,
      offerCounts,
      offers,
      contracts,
      escrows,
      providers: discoverySnapshot.providers,
      recommendationRequirement: requirement,
      primaryRequestId,
    };
  }
}

export const customerCommandCenterRepository = new CustomerCommandCenterRepository();
