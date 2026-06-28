import { buildServer } from "./api/server.js";
import { bootstrapApp } from "./bootstrap/bootstrap.js";

async function main(): Promise<void> {
  const deps = bootstrapApp();
  const app = await buildServer(deps);

  try {
    await app.listen({ host: deps.config.host, port: deps.config.port });
    deps.logger.info({ port: deps.config.port }, "app13-api listening");
  } catch (error) {
    deps.logger.fatal({ err: error }, "failed to start server");
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    deps.logger.info({ signal }, "shutting down");
    await app.close();
    await deps.db.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
