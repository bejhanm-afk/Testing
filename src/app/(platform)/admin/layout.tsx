import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (user.globalRole !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Platformbeheer</h1>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
          ← Naar mijn dashboard
        </Link>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
