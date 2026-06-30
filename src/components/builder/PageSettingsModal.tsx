"use client";

export interface PageSettingsPatch {
  title?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export function PageSettingsModal({
  isHome,
  title,
  slug,
  seoTitle,
  seoDescription,
  onChange,
  onClose,
}: {
  isHome: boolean;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  onChange: (patch: PageSettingsPatch) => void;
  onClose: () => void;
}) {
  const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Pagina-instellingen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Sluiten">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Paginatitel</label>
            <input value={title} onChange={(e) => onChange({ title: e.target.value })} className={field} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Slug (URL)</label>
            <input
              value={isHome ? "" : slug}
              disabled={isHome}
              placeholder={isHome ? "homepagina (/)" : "bijv. over-ons"}
              onChange={(e) => onChange({ slug: e.target.value })}
              className={`${field} ${isHome ? "bg-gray-50 text-gray-400" : ""}`}
            />
            {isHome && <p className="mt-1 text-xs text-gray-400">De homepagina heeft altijd het pad /.</p>}
          </div>

          <hr className="border-gray-100" />

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">SEO-titel</label>
            <input
              value={seoTitle}
              onChange={(e) => onChange({ seoTitle: e.target.value })}
              placeholder="Laat leeg voor de standaard van de site"
              className={field}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">SEO-omschrijving</label>
            <textarea
              value={seoDescription}
              onChange={(e) => onChange({ seoDescription: e.target.value })}
              rows={3}
              placeholder="Korte omschrijving voor zoekmachines"
              className={field}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Klaar
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          Wijzigingen worden opgeslagen met de knop “Opslaan”.
        </p>
      </div>
    </div>
  );
}
