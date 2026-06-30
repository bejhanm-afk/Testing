import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PageRenderer } from "@/blocks/Renderer";
import { SiteShell, type NavItem } from "@/components/public/SiteShell";
import type { BlockInstance } from "@/blocks/definitions";

export const dynamic = "force-dynamic";

/**
 * Public tenant renderer. The middleware rewrites tenant hosts to
 * /site/<key>/<path>, where <key> is a subdomain or "domain:<host>".
 */

type Seo = { title?: string; description?: string };

function decodeSiteKey(raw: string) {
  const key = decodeURIComponent(raw);
  if (key.startsWith("domain:")) {
    return { customDomain: key.slice("domain:".length) };
  }
  return { subdomain: key };
}

async function loadSite(siteKey: string) {
  const where = decodeSiteKey(siteKey);
  return prisma.site.findFirst({
    where: { ...where, status: "ACTIVE" },
    include: { pages: { orderBy: { createdAt: "asc" } } },
  });
}

function findPage(site: NonNullable<Awaited<ReturnType<typeof loadSite>>>, slugParts?: string[]) {
  const slug = (slugParts ?? []).join("/");
  return (
    site.pages.find((p) => p.slug === slug && p.status === "PUBLISHED") ??
    (slug === "" ? site.pages.find((p) => p.isHome && p.status === "PUBLISHED") : undefined)
  );
}

/** Build the nav from published pages: home first, then the rest by creation order. */
function buildNav(site: NonNullable<Awaited<ReturnType<typeof loadSite>>>): NavItem[] {
  return site.pages
    .filter((p) => p.status === "PUBLISHED")
    .sort((a, b) => Number(b.isHome) - Number(a.isHome))
    .map((p) => ({
      title: p.title,
      href: p.isHome || p.slug === "" ? "/" : `/${p.slug}`,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: { key: string; slug?: string[] };
}): Promise<Metadata> {
  const site = await loadSite(params.key);
  if (!site) return { title: "Niet gevonden" };
  const page = findPage(site, params.slug);
  if (!page) return { title: `Niet gevonden — ${site.name}` };

  const siteSeo = (site.seo ?? {}) as Seo;
  const pageSeo = (page.seo ?? {}) as Seo;

  return {
    title: pageSeo.title || siteSeo.title || `${page.title} — ${site.name}`,
    description: pageSeo.description || siteSeo.description || undefined,
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: { key: string; slug?: string[] };
}) {
  const site = await loadSite(params.key);
  if (!site) notFound();

  const page = findPage(site, params.slug);
  if (!page) notFound();

  const theme = (site.theme ?? {}) as { primary?: string };
  const blocks = (page.content ?? []) as unknown as BlockInstance[];
  const currentHref = page.isHome || page.slug === "" ? "/" : `/${page.slug}`;

  return (
    <SiteShell siteName={site.name} nav={buildNav(site)} theme={theme} currentHref={currentHref}>
      <PageRenderer blocks={blocks} theme={theme} />
    </SiteShell>
  );
}
