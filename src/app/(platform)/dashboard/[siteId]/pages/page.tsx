import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { ROOT_DOMAIN } from "@/lib/host";
import { PagesManager, type PageRow } from "@/components/pages-manager";
import { SiteTabs } from "@/components/site-tabs";

export const dynamic = "force-dynamic";

export default async function SitePagesPage({
  params,
}: {
  params: { siteId: string };
}) {
  try {
    await assertSiteAccess(params.siteId, "EDITOR");
  } catch (e) {
    if (e instanceof AuthError && e.status === 401) redirect(`/login?callbackUrl=/dashboard/${params.siteId}/pages`);
    redirect("/dashboard");
  }

  const site = await prisma.site.findUnique({
    where: { id: params.siteId },
    include: { pages: { orderBy: { createdAt: "asc" } } },
  });
  if (!site) redirect("/dashboard");

  const pages: PageRow[] = site.pages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    isHome: p.isHome,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
            ← Alle sites
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
          <a
            href={`http://${site.subdomain}.${ROOT_DOMAIN}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand-600 hover:underline"
          >
            {site.subdomain}.{ROOT_DOMAIN} ↗
          </a>
        </div>
      </div>

      <SiteTabs siteId={site.id} active="pages" />
      <PagesManager siteId={site.id} pages={pages} />
    </div>
  );
}
