"use client";

import { useEffect, useRef, useState } from "react";

export interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaManager({ siteId }: { siteId: string }) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
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

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/sites/${siteId}/media`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setAssets((a) => [data.asset, ...a]);
      else setError(data.error ?? "Upload mislukt");
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(id: string) {
    if (!confirm("Deze afbeelding verwijderen?")) return;
    const res = await fetch(`/api/sites/${siteId}/media/${id}`, { method: "DELETE" });
    if (res.ok) setAssets((a) => a.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {uploading ? "Uploaden…" : "Afbeelding uploaden"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Laden…</p>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          Nog geen media. Upload je eerste afbeelding.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {assets.map((a) => (
            <div key={a.id} className="group overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex aspect-square items-center justify-center bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={a.filename} className="h-full w-full object-cover" />
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium text-gray-700" title={a.filename}>
                  {a.filename}
                </p>
                <p className="text-xs text-gray-400">{formatSize(a.size)}</p>
                <div className="mt-1 flex items-center justify-between">
                  <button
                    onClick={() => navigator.clipboard?.writeText(a.url)}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    Kopieer URL
                  </button>
                  <button onClick={() => remove(a.id)} className="text-xs text-gray-400 hover:text-red-600">
                    Verwijderen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
