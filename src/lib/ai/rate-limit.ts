/**
 * Minimal in-memory per-IP sliding-window rate limiter.
 *
 * ponytail: in-memory means per-instance — on serverless/multi-instance deploys each
 * instance keeps its own window, so effective limits scale with instance count and
 * reset on cold starts. Good enough as a first abuse brake; if multi-instance abuse
 * appears, upgrade to Vercel Firewall rate-limit rules or an Upstash Redis limiter.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 30;
/** Soft cap on tracked IPs before a global stale-entry sweep. */
const MAX_TRACKED_IPS = 5000;

const hits = new Map<string, number[]>();

/** Extract the client IP: first hop of x-forwarded-for, fallback x-real-ip. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the oldest request falls out of the window (only meaningful when blocked). */
  retryAfterSeconds: number;
}

export function checkRateLimit(
  ip: string,
  { windowMs = WINDOW_MS, max = MAX_REQUESTS }: { windowMs?: number; max?: number } = {},
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Occasionally sweep stale IPs so the map cannot grow unbounded.
  if (hits.size > MAX_TRACKED_IPS) {
    for (const [key, timestamps] of hits) {
      if (timestamps.length === 0 || timestamps[timestamps.length - 1] < cutoff) {
        hits.delete(key);
      }
    }
  }

  // Prune this IP's window on access.
  const recent = (hits.get(ip) ?? []).filter(t => t > cutoff);

  if (recent.length >= max) {
    hits.set(ip, recent);
    const retryAfterSeconds = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  hits.set(ip, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Convenience guard for route handlers: returns a 429 Response when the
 * caller is over the limit, or null when the request may proceed.
 */
export function enforceRateLimit(req: Request): Response | null {
  const result = checkRateLimit(getClientIp(req));
  if (result.allowed) return null;
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please slow down.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfterSeconds),
      },
    },
  );
}
