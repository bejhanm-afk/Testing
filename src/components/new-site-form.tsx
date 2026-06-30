"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROOT_DOMAIN } from "@/lib/host";

type Template = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
};

export function NewSiteForm({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onNameChange(value: string) {
    setName(value);
    // Suggest a subdomain from the name until the user edits it manually.
    if (!subdomainTouched) {
      setSubdomain(value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
    }
  }

  const [subdomainTouched, setSubdomainTouched] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subdomain, templateId: templateId || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Aanmaken mislukt");
      return;
    }
    router.push(`/dashboard/${data.site.id}/pages`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Sitenaam</label>
        <input
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Mijn bedrijf"
          className="w-full rounded-lg border border-gray-300 px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Subdomein</label>
        <div className="flex items-center">
          <input
            required
            value={subdomain}
            onChange={(e) => {
              setSubdomainTouched(true);
              setSubdomain(e.target.value);
            }}
            placeholder="mijnbedrijf"
            className="w-full rounded-l-lg border border-gray-300 px-4 py-2"
          />
          <span className="rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
            .{ROOT_DOMAIN}
          </span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Template</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <label
              key={t.id}
              className={`cursor-pointer rounded-lg border p-4 transition ${
                templateId === t.id ? "border-brand-600 ring-2 ring-brand-100" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="template"
                value={t.id}
                checked={templateId === t.id}
                onChange={() => setTemplateId(t.id)}
                className="sr-only"
              />
              <span className="block font-medium text-gray-900">{t.name}</span>
              {t.description && <span className="mt-1 block text-sm text-gray-500">{t.description}</span>}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Bezig..." : "Site aanmaken"}
      </button>
    </form>
  );
}
