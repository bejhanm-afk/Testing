import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { ROOT_DOMAIN } from "@/lib/host";
import { SiteTabs } from "@/components/site-tabs";
import { MediaManager } from "@/components/media/MediaManager";

export const dynamic = "force-dynamic";

export default async function MediaPage({
  params,
}: {
  params: { siteId: string };
}) {
  let canManage = false;
  try {
    const access = await assertSiteAccess(params.siteId, "EDITOR");
    canManage = access.role === "OWNER";
  } catch (e) {
    if (e instanceof AuthError && e.status === 401) redirect(`/login?callbackUrl=/dashboard/${params.siteId}/media`);
    redirect("/dashboard");
  }

  const site = await prisma.site.findUnique({ where: { id: params.siteId } });
  if (!site) redirect("/dashboard");

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
        ← Alle sites
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">{site.name}</h1>
      <p className="mb-4 text-sm text-gray-500">{site.subdomain}.{ROOT_DOMAIN}</p>
      <SiteTabs siteId={site.id} active="media" canManage={canManage} />
      <MediaManager siteId={site.id} />
    </div>
  );
}
