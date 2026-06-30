import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PageRenderer } from "@/blocks/Renderer";
import type { BlockInstance } from "@/blocks/definitions";

export const dynamic = "force-dynamic";

/**
 * Public tenant renderer. The middleware rewrites tenant hosts to
 * /site/<key>/<path>, where <key> is a subdomain or "domain:<host>".
 */

function decodeSiteKey(raw: string) {
  const key = decodeURIComponent(raw);
  if (key.startsWith("domain:")) {
    return { customDomain: key.slice("domain:".length) };
  }
  return { subdomain: key };
}

async function loadPage(siteKey: string, slugParts?: string[]) {
  const where = decodeSiteKey(siteKey);
  const site = await prisma.site.findFirst({
    where: { ...where, status: "ACTIVE" },
    include: {
      pages: true,
    },
  });
  if (!site) return null;

  const slug = (slugParts ?? []).join("/");
  const page =
    site.pages.find((p) => p.slug === slug && p.status === "PUBLISHED") ??
    (slug === "" ? site.pages.find((p) => p.isHome && p.status === "PUBLISHED") : undefined);

  if (!page) return null;
  return { site, page };
}

export async function generateMetadata({
  params,
}: {
  params: { key: string; slug?: string[] };
}): Promise<Metadata> {
  const result = await loadPage(params.key, params.slug);
  if (!result) return { title: "Niet gevonden" };
  const seo = (result.page.seo ?? {}) as { title?: string; description?: string };
  return {
    title: seo.title ?? `${result.page.title} — ${result.site.name}`,
    description: seo.description,
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: { key: string; slug?: string[] };
}) {
  const result = await loadPage(params.key, params.slug);
  if (!result) notFound();

  const { site, page } = result;
  const theme = (site.theme ?? {}) as { primary?: string };
  const blocks = (page.content ?? []) as unknown as BlockInstance[];

  return (
    <div className="min-h-screen bg-white">
      <PageRenderer blocks={blocks} theme={theme} />
    </div>
  );
}
