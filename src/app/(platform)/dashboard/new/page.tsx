import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { NewSiteForm } from "@/components/new-site-form";

export const dynamic = "force-dynamic";

export default async function NewSitePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/new");

  const templates = await prisma.template.findMany({
    where: { isPublished: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, category: true },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Nieuwe site</h1>
      <NewSiteForm templates={templates} />
    </div>
  );
}
