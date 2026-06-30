import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (user.globalRole !== "SUPER_ADMIN") redirect("/dashboard");

  const [sites, users, templates] = await Promise.all([
    prisma.site.count(),
    prisma.user.count(),
    prisma.template.count(),
  ]);

  const stats = [
    { label: "Sites", value: sites },
    { label: "Gebruikers", value: users },
    { label: "Templates", value: templates },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Platformbeheer</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Volledige beheermodules (sites/gebruikers/templates/abonnementen) volgen in fase 5.
      </p>
    </div>
  );
}
