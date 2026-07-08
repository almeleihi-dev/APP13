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

  // OC-1: graceful shutdown — drain HTTP, then release DB and Redis; bounded so
  // a stuck dependency can never hang the process indefinitely.
  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    deps.logger.info({ signal }, "shutting down");

    const hardTimeout = setTimeout(() => {
      deps.logger.fatal({ signal }, "shutdown timed out; forcing exit");
      process.exit(1);
    }, 10_000);
    hardTimeout.unref();

    const closers: Array<[string, () => Promise<unknown>]> = [
      ["http", () => app.close()],
      ["database", () => deps.db.close()],
      ["idempotency", () => deps.idempotency.close()],
      ["sessions", () => deps.sessions.close()],
    ];
    for (const [name, close] of closers) {
      try {
        await close();
      } catch (error) {
        deps.logger.error(
          { err: error, resource: name },
          "error closing resource during shutdown"
        );
      }
    }

    clearTimeout(hardTimeout);
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
