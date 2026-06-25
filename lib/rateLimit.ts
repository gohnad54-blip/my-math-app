import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitScope = "generation" | "export";

const LIMITS: Record<RateLimitScope, number> = {
  generation: 20,
  export: 5,
};

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

function getRateLimiter(scope: RateLimitScope) {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(LIMITS[scope], "1 m"),
    prefix: `parameter-tasks:${scope}`,
  });
}

export async function enforceRateLimit(
  identifier: string,
  scope: RateLimitScope,
): Promise<{ allowed: true } | { allowed: false }> {
  const ratelimit = getRateLimiter(scope);

  if (!ratelimit) {
    return { allowed: true };
  }

  const result = await ratelimit.limit(identifier);
  return result.success ? { allowed: true } : { allowed: false };
}

export function getRateLimitIdentifier(
  sessionCreatedAt?: number,
  forwardedFor?: string | null,
): string {
  if (sessionCreatedAt) {
    return `session:${sessionCreatedAt}`;
  }

  if (forwardedFor) {
    return `ip:${forwardedFor.split(",")[0]?.trim() ?? "unknown"}`;
  }

  return "anonymous";
}
