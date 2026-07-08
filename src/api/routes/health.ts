import type { FastifyInstance } from "fastify";
import type { DbPool } from "../../shared/db/index.js";

export async function registerHealthRoutes(
  app: FastifyInstance,
  db: DbPool
): Promise<void> {
  app.get("/health", async (_request, reply) => {
    await Promise.race([db.query("SELECT 1"), new Promise((_r, rej) => setTimeout(rej, 3000))]);;
    return reply.status(200).send({
      status: "ok",
      service: process.env.APP13_SERVICE_ID ?? "app13-api",
      timestamp: new Date().toISOString(),
    });
  });
}
