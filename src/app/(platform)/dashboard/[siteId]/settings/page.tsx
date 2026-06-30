import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { ROOT_DOMAIN } from "@/lib/host";
import { SiteTabs } from "@/components/site-tabs";
import { SiteSettingsForm, type SiteSettings } from "@/components/site-settings-form";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage({
  params,
}: {
  params: { siteId: string };
}) {
  try {
    await assertSiteAccess(params.siteId, "OWNER");
  } catch (e) {
    if (e instanceof AuthError && e.status === 401) {
      redirect(`/login?callbackUrl=/dashboard/${params.siteId}/settings`);
    }
    // Editors can reach pages but not settings.
    redirect(`/dashboard/${params.siteId}/pages`);
  }

  const site = await prisma.site.findUnique({ where: { id: params.siteId } });
  if (!site) redirect("/dashboard");

  const theme = (site.theme ?? {}) as { primary?: string };
  const seo = (site.seo ?? {}) as { title?: string; description?: string };

  const settings: SiteSettings = {
    id: site.id,
    name: site.name,
    subdomain: site.subdomain,
    customDomain: site.customDomain,
    primary: theme.primary ?? "#4f46e5",
    seoTitle: seo.title ?? "",
    seoDescription: seo.description ?? "",
  };

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
        ← Alle sites
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">{site.name}</h1>
      <p className="mb-4 text-sm text-gray-500">{site.subdomain}.{ROOT_DOMAIN}</p>
      <SiteTabs siteId={site.id} active="settings" />
      <SiteSettingsForm site={settings} />
    </div>
  );
}
