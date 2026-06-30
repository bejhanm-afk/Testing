import { prisma } from "@/lib/db";
import { TIER_PLANS, ORDERED_TIERS } from "@/lib/tiers";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [sites, activeSites, users, admins, pages, templates, byTier, recent] = await Promise.all([
    prisma.site.count(),
    prisma.site.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.user.count({ where: { globalRole: "SUPER_ADMIN" } }),
    prisma.page.count(),
    prisma.template.count(),
    prisma.subscription.groupBy({ by: ["tier"], _count: { tier: true } }),
    prisma.site.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, subdomain: true, createdAt: true } }),
  ]);

  const tierCounts = Object.fromEntries(byTier.map((t) => [t.tier, t._count.tier]));

  const stats = [
    { label: "Sites", value: sites, sub: `${activeSites} actief` },
    { label: "Gebruikers", value: users, sub: `${admins} beheerder(s)` },
    { label: "Pagina's", value: pages },
    { label: "Templates", value: templates },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{s.value}</p>
            {s.sub && <p className="mt-1 text-xs text-gray-400">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Abonnementen</h2>
          <ul className="space-y-2">
            {ORDERED_TIERS.map((tier) => (
              <li key={tier} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{TIER_PLANS[tier].label}</span>
                <span className="font-medium text-gray-900">{tierCounts[tier] ?? 0}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Nieuwste sites</h2>
          <ul className="space-y-2">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{s.name}</span>
                <span className="text-gray-400">{new Date(s.createdAt).toLocaleDateString("nl-NL")}</span>
              </li>
            ))}
            {recent.length === 0 && <li className="text-sm text-gray-400">Nog geen sites.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
