"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROOT_DOMAIN } from "@/lib/host";

export interface SiteSettings {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  primary: string;
  seoTitle: string;
  seoDescription: string;
}

export function SiteSettingsForm({ site }: { site: SiteSettings }) {
  const router = useRouter();
  const [name, setName] = useState(site.name);
  const [customDomain, setCustomDomain] = useState(site.customDomain ?? "");
  const [primary, setPrimary] = useState(site.primary || "#4f46e5");
  const [seoTitle, setSeoTitle] = useState(site.seoTitle);
  const [seoDescription, setSeoDescription] = useState(site.seoDescription);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        customDomain,
        theme: { primary },
        seo: { title: seoTitle, description: seoDescription },
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Opslaan mislukt");
      return;
    }
    setMessage("Opgeslagen");
    router.refresh();
  }

  const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";

  return (
    <form onSubmit={save} className="space-y-8">
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Algemeen</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Sitenaam</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={field} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Subdomein</label>
            <input value={`${site.subdomain}.${ROOT_DOMAIN}`} disabled className={`${field} bg-gray-50 text-gray-500`} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">Custom domain</h2>
        <p className="mb-4 text-xs text-gray-500">
          Koppel je eigen domein (bijv. <code>www.mijnbedrijf.nl</code>). Wijs het via een CNAME/A-record naar het platform; laat leeg om geen custom domain te gebruiken.
        </p>
        <input
          value={customDomain}
          onChange={(e) => setCustomDomain(e.target.value)}
          placeholder="www.mijnbedrijf.nl"
          className={field}
        />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Branding</h2>
        <label className="mb-1 block text-xs font-medium text-gray-600">Primaire kleur</label>
        <div className="flex items-center gap-3">
          <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="h-10 w-16 rounded border border-gray-300" />
          <input value={primary} onChange={(e) => setPrimary(e.target.value)} className={`${field} max-w-[140px]`} />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">SEO (standaard)</h2>
        <p className="mb-4 text-xs text-gray-500">Gebruikt wanneer een pagina geen eigen SEO-titel/omschrijving heeft.</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Standaard titel</label>
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={field} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Standaard omschrijving</label>
            <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} className={field} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "Bezig…" : "Instellingen opslaan"}
        </button>
        {message && <span className="text-sm text-green-600">{message}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
