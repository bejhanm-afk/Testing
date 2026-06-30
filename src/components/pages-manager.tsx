"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface PageRow {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  isHome: boolean;
}

export function PagesManager({
  siteId,
  pages,
}: {
  siteId: string;
  pages: PageRow[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createPage(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/sites/${siteId}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Aanmaken mislukt");
      return;
    }
    setTitle("");
    setCreating(false);
    router.push(`/dashboard/${siteId}/pages/${data.page.id}/edit`);
  }

  async function deletePage(id: string) {
    if (!confirm("Deze pagina verwijderen?")) return;
    const res = await fetch(`/api/sites/${siteId}/pages/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Verwijderen mislukt");
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <span className="text-sm font-medium text-gray-500">Pagina&apos;s</span>
        <button
          onClick={() => setCreating((c) => !c)}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nieuwe pagina
        </button>
      </div>

      {creating && (
        <form onSubmit={createPage} className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Paginatitel"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
          >
            {busy ? "Bezig…" : "Aanmaken"}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </form>
      )}

      <ul className="divide-y divide-gray-100">
        {pages.map((p) => (
          <li key={p.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <span className="font-medium text-gray-900">{p.title}</span>
              <span className="ml-2 text-sm text-gray-400">/{p.slug}</span>
              {p.isHome && (
                <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">home</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  p.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {p.status}
              </span>
              <Link
                href={`/dashboard/${siteId}/pages/${p.id}/edit`}
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                Bewerken
              </Link>
              {!p.isHome && (
                <button
                  onClick={() => deletePage(p.id)}
                  className="text-sm text-gray-400 hover:text-red-600"
                >
                  Verwijderen
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
