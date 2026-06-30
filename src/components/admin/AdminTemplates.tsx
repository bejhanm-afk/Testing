"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AdminTemplateRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  isPublished: boolean;
  pageCount: number;
}

const SCAFFOLD = `{
  "pages": [
    {
      "title": "Home",
      "slug": "",
      "content": [
        { "id": "hero-1", "type": "hero", "data": { "heading": "Titel", "subheading": "Subtitel" } }
      ]
    }
  ]
}`;

export function AdminTemplates({ templates }: { templates: AdminTemplateRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [structure, setStructure] = useState(SCAFFOLD);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    let parsedStructure: unknown;
    try {
      parsedStructure = JSON.parse(structure);
    } catch {
      setError("De structuur is geen geldige JSON");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, category, structure: parsedStructure }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Aanmaken mislukt");
      return;
    }
    setOpen(false);
    setName("");
    setDescription("");
    setCategory("");
    setStructure(SCAFFOLD);
    router.refresh();
  }

  async function togglePublish(t: AdminTemplateRow) {
    const res = await fetch(`/api/admin/templates/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !t.isPublished }),
    });
    if (res.ok) router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Dit template verwijderen?")) return;
    const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {open ? "Annuleren" : "+ Nieuw template"}
        </button>
      </div>

      {open && (
        <form onSubmit={create} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" className={field} />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categorie" className={field} />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Omschrijving" className={field} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Structuur (JSON)</label>
            <textarea
              value={structure}
              onChange={(e) => setStructure(e.target.value)}
              rows={10}
              spellCheck={false}
              className={`${field} font-mono text-xs`}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {busy ? "Bezig…" : "Template opslaan"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Template</th>
              <th className="px-4 py-3">Categorie</th>
              <th className="px-4 py-3">Pagina&apos;s</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {templates.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{t.name}</p>
                  {t.description && <p className="text-xs text-gray-400">{t.description}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{t.category ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{t.pageCount}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => togglePublish(t)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      t.isPublished ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t.isPublished ? "Gepubliceerd" : "Verborgen"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(t.id)} className="text-sm text-gray-400 hover:text-red-600">
                    Verwijderen
                  </button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nog geen templates.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
