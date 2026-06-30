import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { ROOT_DOMAIN } from "@/lib/host";
import { SiteTabs } from "@/components/site-tabs";
import { TeamManager } from "@/components/team/TeamManager";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  params,
}: {
  params: { siteId: string };
}) {
  let userId: string;
  try {
    const access = await assertSiteAccess(params.siteId, "OWNER");
    userId = access.user.id;
  } catch (e) {
    if (e instanceof AuthError && e.status === 401) redirect(`/login?callbackUrl=/dashboard/${params.siteId}/team`);
    redirect(`/dashboard/${params.siteId}/pages`);
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
      <SiteTabs siteId={site.id} active="team" canManage />
      <p className="mb-4 text-sm text-gray-500">
        Voeg bestaande gebruikers toe als <strong>editor</strong> (content bewerken) of{" "}
        <strong>eigenaar</strong> (volledig beheer incl. team en instellingen).
      </p>
      <TeamManager siteId={site.id} currentUserId={userId} />
    </div>
  );
}
