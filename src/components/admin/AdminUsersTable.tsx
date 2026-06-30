"use client";

import { useState } from "react";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  globalRole: "USER" | "SUPER_ADMIN";
  siteCount: number;
}

export function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const [rows, setRows] = useState(users);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleAdmin(u: AdminUserRow) {
    const next = u.globalRole === "SUPER_ADMIN" ? "USER" : "SUPER_ADMIN";
    setBusy(u.id);
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ globalRole: next }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      alert(data.error ?? "Wijzigen mislukt");
      return;
    }
    setRows((r) => r.map((x) => (x.id === u.id ? { ...x, globalRole: next } : x)));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <th className="px-4 py-3">Gebruiker</th>
            <th className="px-4 py-3">Sites</th>
            <th className="px-4 py-3">Platformrol</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((u) => (
            <tr key={u.id} className={busy === u.id ? "opacity-50" : ""}>
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{u.name ?? u.email}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </td>
              <td className="px-4 py-3 text-gray-600">{u.siteCount}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    u.globalRole === "SUPER_ADMIN" ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {u.globalRole === "SUPER_ADMIN" ? "Super-admin" : "Gebruiker"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {u.id === currentUserId ? (
                  <span className="text-xs text-gray-400">(jij)</span>
                ) : (
                  <button onClick={() => toggleAdmin(u)} className="text-sm text-brand-600 hover:underline">
                    {u.globalRole === "SUPER_ADMIN" ? "Rechten intrekken" : "Maak super-admin"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
