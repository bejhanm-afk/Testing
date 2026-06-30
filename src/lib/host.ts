/**
 * Pure host / tenant parsing utilities. NO server-only imports (no Prisma, no
 * fs) so this module is safe in:
 *   - edge middleware
 *   - client components
 *   - server components / route handlers
 *
 * Database-backed resolution (resolveSiteId) lives in tenant.ts.
 */

export const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

/** Reserved subdomains that never resolve to a tenant. */
const RESERVED_SUBDOMAINS = new Set(["app", "www", "admin", "api"]);

export type HostInfo =
  | { kind: "platform" }
  | { kind: "subdomain"; subdomain: string }
  | { kind: "custom"; domain: string };

/** Strip a port and lowercase a host header value. */
function normalizeHost(host: string): string {
  return host.split(":")[0].toLowerCase().replace(/\.$/, "");
}

/** Classify an incoming Host header into platform vs. tenant. */
export function parseHost(rawHost: string | null | undefined): HostInfo {
  const root = normalizeHost(ROOT_DOMAIN);
  const host = normalizeHost(rawHost ?? "");

  if (!host || host === root || host === `www.${root}` || host === `app.${root}`) {
    return { kind: "platform" };
  }

  if (host.endsWith(`.${root}`)) {
    const subdomain = host.slice(0, host.length - root.length - 1);
    if (RESERVED_SUBDOMAINS.has(subdomain)) return { kind: "platform" };
    return { kind: "subdomain", subdomain };
  }

  // Anything not under the root domain is treated as a custom domain.
  return { kind: "custom", domain: host };
}

/** Subdomains must be url-safe and not collide with reserved names. */
export function normalizeSubdomain(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}

export function isReservedSubdomain(sub: string): boolean {
  return RESERVED_SUBDOMAINS.has(sub);
}
