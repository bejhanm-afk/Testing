import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/authz";
import { AdminUsersTable, type AdminUserRow } from "@/components/admin/AdminUsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await getCurrentUser();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true } } },
  });

  const rows: AdminUserRow[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    globalRole: u.globalRole,
    siteCount: u._count.memberships,
  }));

  return <AdminUsersTable users={rows} currentUserId={me?.id ?? ""} />;
}
