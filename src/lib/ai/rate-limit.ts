import Redis from "ioredis";
import { env } from "@/lib/env";
import type { AIRateLimitResult } from "@/lib/ai/types";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = env.REDIS_URL;
  if (!url) return null;

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });
    return redis;
  } catch {
    return null;
  }
}

const RATE_LIMIT_PREFIX = "ai:ratelimit:";
const RATE_LIMIT_MAX = env.AI_RATE_LIMIT_MAX;
const RATE_LIMIT_WINDOW = env.AI_RATE_LIMIT_WINDOW;

export async function checkAIRateLimit(
  userId: string,
): Promise<AIRateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    return { allowed: true, remaining: RATE_LIMIT_MAX, resetAt: Date.now() + RATE_LIMIT_WINDOW * 1000 };
  }

  const key = `${RATE_LIMIT_PREFIX}${userId}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - RATE_LIMIT_WINDOW;

  try {
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, `${now}-${Math.random().toString(36).slice(2)}`);
    pipeline.zcard(key);
    pipeline.expire(key, RATE_LIMIT_WINDOW);

    const results = await pipeline.exec();
    if (!results) {
      return { allowed: true, remaining: RATE_LIMIT_MAX, resetAt: now + RATE_LIMIT_WINDOW };
    }

    const countResult = results[2];
    const count = typeof countResult[1] === "number" ? countResult[1] : 0;

    const resetAt = now + RATE_LIMIT_WINDOW;
    const remaining = Math.max(0, RATE_LIMIT_MAX - count);

    return {
      allowed: count <= RATE_LIMIT_MAX,
      remaining,
      resetAt: resetAt * 1000,
    };
  } catch {
    return { allowed: true, remaining: RATE_LIMIT_MAX, resetAt: Date.now() + RATE_LIMIT_WINDOW * 1000 };
  }
}

export function getRateLimitHeaders(result: AIRateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
  };
}
