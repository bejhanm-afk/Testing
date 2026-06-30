"use client";

import { useState } from "react";

export interface AdminSiteRow {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  status: "ACTIVE" | "SUSPENDED";
  tier: "FREE" | "PRO" | "BUSINESS";
  ownerEmail: string;
  pageCount: number;
}

export function AdminSitesTable({ sites }: { sites: AdminSiteRow[] }) {
  const [rows, setRows] = useState(sites);
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(id);
    const res = await fetch(`/api/admin/sites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    if (!res.ok) {
      alert("Wijzigen mislukt");
      return;
    }
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...body } : x)));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <th className="px-4 py-3">Site</th>
            <th className="px-4 py-3">Eigenaar</th>
            <th className="px-4 py-3">Pagina&apos;s</th>
            <th className="px-4 py-3">Abonnement</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((s) => (
            <tr key={s.id} className={busy === s.id ? "opacity-50" : ""}>
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-400">{s.customDomain ?? s.subdomain}</p>
              </td>
              <td className="px-4 py-3 text-gray-600">{s.ownerEmail}</td>
              <td className="px-4 py-3 text-gray-600">{s.pageCount}</td>
              <td className="px-4 py-3">
                <select
                  value={s.tier}
                  onChange={(e) => patch(s.id, { tier: e.target.value })}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                >
                  <option value="FREE">Gratis</option>
                  <option value="PRO">Pro</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => patch(s.id, { status: s.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    s.status === "ACTIVE"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  {s.status === "ACTIVE" ? "Actief" : "Geschorst"}
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                Nog geen sites.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
