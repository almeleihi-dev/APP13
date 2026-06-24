import type { FastifyInstance } from "fastify";
import type { ProfessionOntologyService } from "../../profession-ontology/application/profession-ontology-service.js";
import type { ProfessionOntologyEntryView } from "../../profession-ontology/domain/profession-ontology.js";

export async function registerProfessionOntologyRoutes(
  app: FastifyInstance,
  professionOntology: ProfessionOntologyService
): Promise<void> {
  app.get(
    "/profession-ontology",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(professionOntology.getCenter(request.authContext!));
    }
  );

  app.get(
    "/profession-ontology/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(professionOntology.getOverview(request.authContext!));
    }
  );

  app.get(
    "/profession-ontology/registry",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(professionOntology.listRegistry(request.authContext!));
    }
  );

  app.get(
    "/profession-ontology/hierarchy",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(professionOntology.getHierarchy(request.authContext!));
    }
  );

  app.get(
    "/profession-ontology/professions",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(professionOntology.listProfessions(request.authContext!));
    }
  );

  app.post(
    "/profession-ontology/classify",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        profession_name?: string;
        trade?: string;
        specialization?: string;
        license?: string;
        certification?: string;
        cv_job_title?: string;
        business_category?: string;
      };
      return reply.send(professionOntology.classify(request.authContext!, body));
    }
  );

  app.post(
    "/profession-ontology/transform",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        profession_name?: string;
        trade?: string;
        specialization?: string;
        license?: string;
        certification?: string;
        cv_job_title?: string;
        business_category?: string;
      };
      return reply.send(professionOntology.transform(request.authContext!, body));
    }
  );

  app.get(
    "/profession-ontology/blueprint-bindings",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(professionOntology.getBlueprintBindings(request.authContext!));
    }
  );

  app.get(
    "/profession-ontology/taxonomy-bindings",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(professionOntology.getTaxonomyBindings(request.authContext!));
    }
  );

  app.get(
    "/profession-ontology/schema",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(professionOntology.getSchema(request.authContext!));
    }
  );

  app.post(
    "/profession-ontology/publish",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { entry: ProfessionOntologyEntryView };
      return reply.send(professionOntology.publish(request.authContext!, body.entry));
    }
  );

  app.post(
    "/profession-ontology/deprecate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { profession_id: string; successor_profession_id?: string };
      return reply.send(professionOntology.deprecate(request.authContext!, body));
    }
  );

  app.get(
    "/profession-ontology/professions/:professionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const params = request.params as { professionId: string };
      return reply.send(
        professionOntology.getProfession(request.authContext!, params.professionId)
      );
    }
  );
}
