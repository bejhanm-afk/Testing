import { prisma } from "@/lib/db";
import { AdminTemplates, type AdminTemplateRow } from "@/components/admin/AdminTemplates";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const templates = await prisma.template.findMany({ orderBy: { createdAt: "desc" } });

  const rows: AdminTemplateRow[] = templates.map((t) => {
    const structure = (t.structure ?? {}) as { pages?: unknown[] };
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      isPublished: t.isPublished,
      pageCount: structure.pages?.length ?? 0,
    };
  });

  return <AdminTemplates templates={rows} />;
}
