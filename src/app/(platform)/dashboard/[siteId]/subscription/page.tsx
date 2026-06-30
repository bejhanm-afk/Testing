import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { ROOT_DOMAIN } from "@/lib/host";
import { SiteTabs } from "@/components/site-tabs";
import { SubscriptionPanel } from "@/components/subscription/SubscriptionPanel";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage({
  params,
}: {
  params: { siteId: string };
}) {
  try {
    await assertSiteAccess(params.siteId, "OWNER");
  } catch (e) {
    if (e instanceof AuthError && e.status === 401) redirect(`/login?callbackUrl=/dashboard/${params.siteId}/subscription`);
    redirect(`/dashboard/${params.siteId}/pages`);
  }

  const site = await prisma.site.findUnique({
    where: { id: params.siteId },
    include: { subscription: true, _count: { select: { pages: true } } },
  });
  if (!site) redirect("/dashboard");

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
        ← Alle sites
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">{site.name}</h1>
      <p className="mb-4 text-sm text-gray-500">{site.subdomain}.{ROOT_DOMAIN}</p>
      <SiteTabs siteId={site.id} active="subscription" canManage />
      <SubscriptionPanel
        siteId={site.id}
        currentTier={site.subscription?.tier ?? "FREE"}
        pageCount={site._count.pages}
      />
    </div>
  );
}
