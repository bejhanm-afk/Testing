import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { SiteRole } from "@prisma/client";

/**
 * Authorization helpers. Every API route / server action that touches tenant
 * data must go through `assertSiteAccess` so we never trust a client-supplied
 * siteId without checking membership.
 */

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

const ROLE_RANK: Record<SiteRole, number> = { EDITOR: 1, OWNER: 2 };

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401, "Niet ingelogd");
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.globalRole !== "SUPER_ADMIN") {
    throw new AuthError(403, "Geen platformbeheerder");
  }
  return user;
}

/**
 * Assert that the current user may act on `siteId` with at least `minRole`.
 * Super-admins always pass. Returns the user + their effective site role.
 */
export async function assertSiteAccess(siteId: string, minRole: SiteRole = "EDITOR") {
  const user = await requireUser();

  if (user.globalRole === "SUPER_ADMIN") {
    return { user, role: "OWNER" as SiteRole };
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_siteId: { userId: user.id, siteId } },
    select: { role: true },
  });

  if (!membership) throw new AuthError(403, "Geen toegang tot deze site");
  if (ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
    throw new AuthError(403, "Onvoldoende rechten");
  }

  return { user, role: membership.role };
}

/** List the sites the current user can access (all sites for super-admin). */
export async function listAccessibleSites() {
  const user = await requireUser();

  if (user.globalRole === "SUPER_ADMIN") {
    return prisma.site.findMany({ orderBy: { createdAt: "desc" } });
  }

  return prisma.site.findMany({
    where: { memberships: { some: { userId: user.id } } },
    orderBy: { createdAt: "desc" },
  });
}
