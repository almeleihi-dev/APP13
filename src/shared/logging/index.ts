import pino, { type Logger, type LoggerOptions } from "pino";
import type { AppConfig } from "../config/index.js";

export type { Logger };

export function createLogger(config: AppConfig): Logger {
  const options: LoggerOptions = {
    level: config.logLevel,
    base: {
      service: config.serviceId,
      env: config.env,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (config.logPretty && config.env === "local") {
    return pino({
      ...options,
      transport: {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      },
    });
  }

  return pino(options);
}

export function childLogger(
  parent: Logger,
  bindings: Record<string, unknown>
): Logger {
  return parent.child(bindings);
}
