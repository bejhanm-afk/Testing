import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, listAccessibleSites } from "@/lib/authz";
import { ROOT_DOMAIN } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const sites = await listAccessibleSites();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mijn sites</h1>
        <Link
          href="/dashboard/new"
          className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
        >
          + Nieuwe site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-600">Je hebt nog geen sites.</p>
          <Link href="/dashboard/new" className="mt-3 inline-block text-brand-600 hover:underline">
            Maak je eerste site
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Link
              key={site.id}
              href={`/dashboard/${site.id}/pages`}
              className="rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
            >
              <h2 className="font-semibold text-gray-900">{site.name}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {site.subdomain}.{ROOT_DOMAIN}
              </p>
              <span
                className={`mt-3 inline-block rounded-full px-2 py-0.5 text-xs ${
                  site.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {site.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
