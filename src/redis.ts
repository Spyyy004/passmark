import Redis from "ioredis";
import { logger } from "./logger";

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  logger.warn(
    "REDIS_URL not set. Step caching, global placeholders, and project data are disabled.",
  );
}

export { redis };
