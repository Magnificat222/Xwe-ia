// Fixed-window rate limiter backed by PostgreSQL.
//
// Why the database: the app runs on serverless functions (Vercel), where an
// in-memory counter is per-instance and therefore useless. The table is tiny
// and each check is ONE atomic INSERT ... ON CONFLICT DO UPDATE, so concurrent
// requests cannot slip under the limit.
//
// This is an abuse brake, NOT a source of truth: money and credits stay
// protected by their own DB constraints. If the limiter itself fails (DB
// hiccup) it FAILS OPEN and logs, so a limiter problem never takes the site down.
import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/errors";

export type RateLimitOptions = {
  key: string; // build it with rlKey(...)
  limit: number; // max hits per window
  windowSec: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
};

// Keys never store raw e-mails / IPs / user ids: they are hashed.
export function rlKey(scope: string, ...parts: Array<string | null | undefined>): string {
  const hash = crypto
    .createHash("sha256")
    .update(parts.map((p) => p ?? "").join("|"))
    .digest("hex")
    .slice(0, 32);
  return `${scope}:${hash}`;
}

// On Vercel, x-forwarded-for / x-real-ip are set by the platform edge (a
// client-supplied value is overwritten), so the first entry is the real client.
export function getClientIp(request: { headers: Headers } | null | undefined): string {
  const headers = request?.headers;
  if (!headers) return "unknown";
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function rateLimit({ key, limit, windowSec }: RateLimitOptions): Promise<RateLimitResult> {
  const windowMs = windowSec * 1000;
  const now = Date.now();
  const windowStartMs = Math.floor(now / windowMs) * windowMs;
  const retryAfterSec = Math.max(1, Math.ceil((windowStartMs + windowMs - now) / 1000));

  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "windowStart", "count")
      VALUES (${key}, ${new Date(windowStartMs)}, 1)
      ON CONFLICT ("key", "windowStart")
      DO UPDATE SET "count" = "RateLimit"."count" + 1
      RETURNING "count"`;
    const count = Number(rows[0]?.count ?? 1);

    // Housekeeping: ~1% of calls purge windows older than two days.
    if (Math.random() < 0.01) {
      await prisma.$executeRaw`
        DELETE FROM "RateLimit" WHERE "windowStart" < ${new Date(now - 2 * 24 * 60 * 60 * 1000)}`.catch(() => 0);
    }

    return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfterSec };
  } catch (error) {
    console.error("[rate-limit] check failed, allowing request", error);
    return { allowed: true, remaining: limit, retryAfterSec };
  }
}

export function rateLimitResponse(result: RateLimitResult, message = "Trop de requêtes. Réessayez plus tard.") {
  return NextResponse.json(
    { error: message, code: "RATE_LIMITED" },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSec) } }
  );
}

// For service-style routes that already map ServiceError -> HTTP response.
export async function enforceRateLimit(options: RateLimitOptions, message?: string): Promise<void> {
  const result = await rateLimit(options);
  if (!result.allowed) {
    throw new ServiceError("RATE_LIMITED", message ?? "Trop de requêtes. Réessayez plus tard.", 429);
  }
}
