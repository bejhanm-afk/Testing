import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { ROOT_DOMAIN } from "@/lib/host";
import { BuilderClient, type BuilderPage } from "@/components/builder/BuilderClient";
import type { BlockInstance } from "@/blocks/definitions";

export const dynamic = "force-dynamic";

export default async function BuilderPageRoute({
  params,
}: {
  params: { siteId: string; pageId: string };
}) {
  try {
    await assertSiteAccess(params.siteId, "EDITOR");
  } catch (e) {
    if (e instanceof AuthError && e.status === 401) {
      redirect(`/login?callbackUrl=/dashboard/${params.siteId}/pages/${params.pageId}/edit`);
    }
    redirect("/dashboard");
  }

  const page = await prisma.page.findFirst({
    where: { id: params.pageId, siteId: params.siteId },
    include: { site: { select: { subdomain: true, theme: true } } },
  });
  if (!page) redirect(`/dashboard/${params.siteId}/pages`);

  const theme = (page.site.theme ?? {}) as { primary?: string };
  const builderPage: BuilderPage = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: page.status,
    content: (page.content ?? []) as unknown as BlockInstance[],
  };

  const publicUrl = `http://${page.site.subdomain}.${ROOT_DOMAIN}/${page.slug}`;

  return (
    <BuilderClient
      siteId={params.siteId}
      page={builderPage}
      theme={theme}
      publicUrl={publicUrl}
    />
  );
}
