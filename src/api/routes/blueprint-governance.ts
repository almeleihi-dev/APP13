import type { FastifyInstance } from "fastify";
import type { BlueprintGovernanceService } from "../../blueprint-governance/application/blueprint-governance-service.js";
import type { ActionBlueprintView } from "../../action-blueprint/domain/action-blueprint.js";
import type { CertificationLevel } from "../../blueprint-governance/domain/blueprint-certification.js";
import type { GovernanceStatus } from "../../blueprint-governance/domain/blueprint-lifecycle.js";

export async function registerBlueprintGovernanceRoutes(
  app: FastifyInstance,
  blueprintGovernance: BlueprintGovernanceService
): Promise<void> {
  app.get(
    "/blueprint-governance",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(blueprintGovernance.getCenter(request.authContext!));
    }
  );

  app.get(
    "/blueprint-governance/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(blueprintGovernance.getOverview(request.authContext!));
    }
  );

  app.get(
    "/blueprint-governance/registry",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(blueprintGovernance.getRegistry(request.authContext!));
    }
  );

  app.get(
    "/blueprint-governance/registry/:blueprintId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const params = request.params as { blueprintId: string };
      const query = request.query as { version?: string };
      return reply.send(
        blueprintGovernance.getRegistryEntry(
          request.authContext!,
          decodeURIComponent(params.blueprintId),
          query.version
        )
      );
    }
  );

  app.get(
    "/blueprint-governance/versions",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { blueprint_id?: string };
      return reply.send(
        blueprintGovernance.getVersions(request.authContext!, query.blueprint_id)
      );
    }
  );

  app.get(
    "/blueprint-governance/certification",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { blueprint_id?: string; version?: string };
      return reply.send(
        blueprintGovernance.getCertification(
          request.authContext!,
          query.blueprint_id,
          query.version
        )
      );
    }
  );

  app.get(
    "/blueprint-governance/governance",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(blueprintGovernance.getGovernance(request.authContext!));
    }
  );

  app.get(
    "/blueprint-governance/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(blueprintGovernance.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/blueprint-governance/search",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as {
        q?: string;
        domain?: string;
        taxonomy_code?: string;
        status?: GovernanceStatus;
      };
      return reply.send(blueprintGovernance.search(request.authContext!, query));
    }
  );

  app.get(
    "/blueprint-governance/schema",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(blueprintGovernance.getSchema(request.authContext!));
    }
  );

  app.post(
    "/blueprint-governance/publish",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { blueprint?: ActionBlueprintView; blueprint_id?: string };
      return reply.send(blueprintGovernance.publish(request.authContext!, body));
    }
  );

  app.post(
    "/blueprint-governance/deprecate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint_id: string;
        version: string;
        successor_registry_id?: string;
      };
      return reply.send(blueprintGovernance.deprecate(request.authContext!, body));
    }
  );

  app.post(
    "/blueprint-governance/certify",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        blueprint_id: string;
        version: string;
        target_level: CertificationLevel;
        blueprint?: ActionBlueprintView;
      };
      return reply.send(blueprintGovernance.certify(request.authContext!, body));
    }
  );
}
