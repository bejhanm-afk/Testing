import { prisma } from "@/lib/db";
import { AdminSitesTable, type AdminSiteRow } from "@/components/admin/AdminSitesTable";

export const dynamic = "force-dynamic";

export default async function AdminSitesPage() {
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: { select: { tier: true } },
      memberships: {
        where: { role: "OWNER" },
        take: 1,
        include: { user: { select: { email: true } } },
      },
      _count: { select: { pages: true } },
    },
  });

  const rows: AdminSiteRow[] = sites.map((s) => ({
    id: s.id,
    name: s.name,
    subdomain: s.subdomain,
    customDomain: s.customDomain,
    status: s.status,
    tier: s.subscription?.tier ?? "FREE",
    ownerEmail: s.memberships[0]?.user.email ?? "—",
    pageCount: s._count.pages,
  }));

  return <AdminSitesTable sites={rows} />;
}
