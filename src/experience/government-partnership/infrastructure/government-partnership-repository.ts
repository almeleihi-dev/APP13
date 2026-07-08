import type { Queryable } from "../../../shared/db/index.js";
import { createInvestorReadinessRepository } from "../../investor-readiness/infrastructure/investor-readiness-repository.js";
import type { GovernmentPartnershipRawSnapshot } from "../domain/government-partnership.js";

export class GovernmentPartnershipRepository {
  constructor(
    private readonly investorRepository = createInvestorReadinessRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<GovernmentPartnershipRawSnapshot> {
    const investorRaw = await this.investorRepository.loadRawSnapshot(client);

    return {
      investorRaw,
    };
  }
}

export function createGovernmentPartnershipRepository(deps?: {
  rootDir?: string;
  investorRepository?: ReturnType<typeof createInvestorReadinessRepository>;
}): GovernmentPartnershipRepository {
  const investorRepository =
    deps?.investorRepository ?? createInvestorReadinessRepository({ rootDir: deps?.rootDir });

  return new GovernmentPartnershipRepository(investorRepository);
}

export const governmentPartnershipRepository = createGovernmentPartnershipRepository();
