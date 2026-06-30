"use client";

import { useEffect, useRef, useState } from "react";

interface Asset {
  id: string;
  url: string;
  filename: string;
}

export function MediaPickerModal({
  siteId,
  onSelect,
  onClose,
}: {
  siteId: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/sites/${siteId}/media`)
      .then((r) => r.json())
      .then((d) => setAssets(d.media ?? []))
      .catch(() => setError("Laden mislukt"))
      .finally(() => setLoading(false));
  }, [siteId]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", files[0]);
    const res = await fetch(`/api/sites/${siteId}/media`, { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (res.ok) {
      setAssets((a) => [data.asset, ...a]);
      onSelect(data.asset.url);
      onClose();
    } else {
      setError(data.error ?? "Upload mislukt");
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Kies een afbeelding</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {uploading ? "Uploaden…" : "Upload nieuw"}
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files)} />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Sluiten">
              ✕
            </button>
          </div>
        </div>

        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-500">Laden…</p>
          ) : assets.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">Nog geen media — upload een afbeelding.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {assets.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    onSelect(a.url);
                    onClose();
                  }}
                  className="overflow-hidden rounded-lg border border-gray-200 transition hover:border-brand-500 hover:ring-2 hover:ring-brand-100"
                  title={a.filename}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.url} alt={a.filename} className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
