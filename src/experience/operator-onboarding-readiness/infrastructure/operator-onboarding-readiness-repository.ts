import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { Queryable } from "../../../shared/db/index.js";
import { createOperatorExperienceIntegrityRepository } from "../../operator-experience-integrity/infrastructure/operator-experience-integrity-repository.js";
import {
  collectOperatorOnboardingReadinessPaths,
  ONBOARDING_VERIFICATION_CHAIN_SPECS,
  type OperatorOnboardingReadinessRawSnapshot,
  type OperatorOnboardingReadinessSources,
} from "../domain/operator-onboarding-readiness.js";

export class OperatorOnboardingReadinessRepository {
  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly integrityRepository = createOperatorExperienceIntegrityRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<OperatorOnboardingReadinessRawSnapshot> {
    const [integrityRaw, sources] = await Promise.all([
      this.integrityRepository.loadRawSnapshot(client),
      this.loadOnboardingSources(),
    ]);

    return {
      integrityRaw,
      sources,
    };
  }

  async loadOnboardingSources(): Promise<OperatorOnboardingReadinessSources> {
    const packageSource = await this.readOptional("package.json");
    const verifyScriptSources: Record<string, string> = {};

    await Promise.all(
      ONBOARDING_VERIFICATION_CHAIN_SPECS.map(async (spec) => {
        verifyScriptSources[spec.script] = await this.readOptional(spec.script);
      })
    );

    const existingPaths = await this.loadExistingPaths([
      ...collectOperatorOnboardingReadinessPaths(),
      ...ONBOARDING_VERIFICATION_CHAIN_SPECS.map((spec) => spec.script),
    ]);

    return {
      packageSource,
      existingPaths,
      verifyScriptSources,
    };
  }

  private async readOptional(relativePath: string): Promise<string> {
    try {
      return await readFile(path.join(this.rootDir, relativePath), "utf8");
    } catch {
      return "";
    }
  }

  private async loadExistingPaths(relativePaths: string[]): Promise<Set<string>> {
    const existingPaths = new Set<string>();
    await Promise.all(
      relativePaths.map(async (relativePath) => {
        try {
          await access(path.join(this.rootDir, relativePath));
          existingPaths.add(relativePath);
        } catch {
          // path missing
        }
      })
    );
    return existingPaths;
  }
}

export function createOperatorOnboardingReadinessRepository(input?: {
  rootDir?: string;
  integrityRepository?: ReturnType<typeof createOperatorExperienceIntegrityRepository>;
}): OperatorOnboardingReadinessRepository {
  return new OperatorOnboardingReadinessRepository(
    input?.rootDir,
    input?.integrityRepository ??
      createOperatorExperienceIntegrityRepository({ rootDir: input?.rootDir })
  );
}

export const operatorOnboardingReadinessRepository = createOperatorOnboardingReadinessRepository();
