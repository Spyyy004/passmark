import pino from "pino";

export const logger = pino({
  name: "passmark-ai",
  level: process.env.PASSMARK_LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
