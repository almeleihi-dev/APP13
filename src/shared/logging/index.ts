import pino, { type Logger, type LoggerOptions } from "pino";
import type { AppConfig } from "../config/index.js";

export type { Logger };

export function buildPinoOptions(config: AppConfig): LoggerOptions | null {
  if (config.logLevel === "off") {
    return null;
  }

  const options: LoggerOptions = {
    level: config.logLevel,
    base: {
      service: config.serviceId,
      env: config.env,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (config.logPretty && config.env === "local") {
    return {
      ...options,
      transport: {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      },
    };
  }

  return options;
}

export function resolveFastifyLogger(
  config: AppConfig
): false | LoggerOptions {
  const options = buildPinoOptions(config);
  if (!options) {
    return false;
  }

  return options;
}

export function createLogger(config: AppConfig): Logger {
  const options = buildPinoOptions(config);
  if (!options) {
    return pino({ level: "silent" });
  }

  return pino(options);
}

export function childLogger(
  parent: Logger,
  bindings: Record<string, unknown>
): Logger {
  return parent.child(bindings);
}
