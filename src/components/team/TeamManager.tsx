"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  role: "OWNER" | "EDITOR";
  user: { id: string; email: string; name: string | null };
}

export function TeamManager({
  siteId,
  currentUserId,
}: {
  siteId: string;
  currentUserId: string;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"OWNER" | "EDITOR">("EDITOR");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sites/${siteId}/members`)
      .then((r) => r.json())
      .then((d) => setMembers(d.members ?? []))
      .catch(() => setError("Laden mislukt"))
      .finally(() => setLoading(false));
  }, [siteId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/sites/${siteId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Toevoegen mislukt");
      return;
    }
    setMembers((m) => [...m, data.member]);
    setEmail("");
  }

  async function changeRole(id: string, newRole: "OWNER" | "EDITOR") {
    const res = await fetch(`/api/sites/${siteId}/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setMembers((m) => m.map((x) => (x.id === id ? data.member : x)));
    else alert(data.error ?? "Wijzigen mislukt");
  }

  async function remove(id: string) {
    if (!confirm("Dit teamlid verwijderen?")) return;
    const res = await fetch(`/api/sites/${siteId}/members/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setMembers((m) => m.filter((x) => x.id !== id));
    else alert(data.error ?? "Verwijderen mislukt");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mailadres van bestaand account"
          className="min-w-[240px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "OWNER" | "EDITOR")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="EDITOR">Editor</option>
          <option value="OWNER">Eigenaar</option>
        </select>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "Bezig…" : "Toevoegen"}
        </button>
        {error && <span className="w-full text-sm text-red-600">{error}</span>}
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <p className="p-5 text-sm text-gray-500">Laden…</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="font-medium text-gray-900">{m.user.name ?? m.user.email}</span>
                  {m.user.id === currentUserId && <span className="ml-2 text-xs text-gray-400">(jij)</span>}
                  <p className="text-sm text-gray-500">{m.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={m.role}
                    onChange={(e) => changeRole(m.id, e.target.value as "OWNER" | "EDITOR")}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="OWNER">Eigenaar</option>
                  </select>
                  <button onClick={() => remove(m.id)} className="text-sm text-gray-400 hover:text-red-600">
                    Verwijderen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
