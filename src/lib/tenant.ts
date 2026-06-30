import { prisma } from "@/lib/db";
import { parseHost, ROOT_DOMAIN } from "@/lib/host";

/**
 * Database-backed tenant resolution. Pure host parsing lives in host.ts so it
 * can be used from edge middleware and client components without pulling Prisma
 * into those bundles.
 */

export { ROOT_DOMAIN };
export { parseHost, normalizeSubdomain, isReservedSubdomain } from "@/lib/host";

/** Resolve a Host header to a Site id (or null). Used by the public renderer. */
export async function resolveSiteId(rawHost: string | null | undefined) {
  const info = parseHost(rawHost);
  if (info.kind === "platform") return null;

  const site = await prisma.site.findFirst({
    where:
      info.kind === "subdomain"
        ? { subdomain: info.subdomain, status: "ACTIVE" }
        : { customDomain: info.domain, status: "ACTIVE" },
    select: { id: true },
  });

  return site?.id ?? null;
}
