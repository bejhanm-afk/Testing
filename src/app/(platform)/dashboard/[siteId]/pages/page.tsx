import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { ROOT_DOMAIN } from "@/lib/tenant";

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

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
            ← Alle sites
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
          <a
            href={`http://${site.subdomain}.${ROOT_DOMAIN}`}
            className="text-sm text-brand-600 hover:underline"
          >
            {site.subdomain}.{ROOT_DOMAIN}
          </a>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3 text-sm font-medium text-gray-500">
          Pagina&apos;s
        </div>
        <ul className="divide-y divide-gray-100">
          {site.pages.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <span className="font-medium text-gray-900">{p.title}</span>
                <span className="ml-2 text-sm text-gray-400">/{p.slug}</span>
                {p.isHome && (
                  <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">home</span>
                )}
              </div>
              <span className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    p.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p.status}
                </span>
                <span className="text-sm text-gray-400">Builder volgt (fase 2)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
