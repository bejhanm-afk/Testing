"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { createBlockInstance, type BlockInstance } from "@/blocks/definitions";
import { Palette } from "./Palette";
import { Canvas } from "./Canvas";
import { Inspector } from "./Inspector";
import { PageSettingsModal } from "./PageSettingsModal";

type Theme = { primary?: string };

export interface BuilderPage {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  isHome: boolean;
  content: BlockInstance[];
  seoTitle: string;
  seoDescription: string;
}

export function BuilderClient({
  siteId,
  page,
  theme,
  publicUrl,
}: {
  siteId: string;
  page: BuilderPage;
  theme: Theme;
  publicUrl: string;
}) {
  const [blocks, setBlocks] = useState<BlockInstance[]>(page.content);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(page.status);
  const [message, setMessage] = useState<string | null>(null);

  // Page-level settings (title, slug, SEO).
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle);
  const [seoDescription, setSeoDescription] = useState(page.seoDescription);

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedId) ?? null,
    [blocks, selectedId]
  );

  const mutate = useCallback((next: BlockInstance[]) => {
    setBlocks(next);
    setDirty(true);
  }, []);

  const addBlock = useCallback(
    (type: string) => {
      const instance = createBlockInstance(type);
      mutate([...blocks, instance]);
      setSelectedId(instance.id);
    },
    [blocks, mutate]
  );

  const removeBlock = useCallback(
    (id: string) => {
      mutate(blocks.filter((b) => b.id !== id));
      setSelectedId((s) => (s === id ? null : s));
    },
    [blocks, mutate]
  );

  const moveBlock = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= blocks.length) return;
      const next = [...blocks];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      mutate(next);
    },
    [blocks, mutate]
  );

  const updateField = useCallback(
    (key: string, value: string) => {
      if (!selectedId) return;
      mutate(
        blocks.map((b) =>
          b.id === selectedId ? { ...b, data: { ...b.data, [key]: value } } : b
        )
      );
    },
    [blocks, selectedId, mutate]
  );

  const save = useCallback(
    async (nextStatus?: "DRAFT" | "PUBLISHED") => {
      setSaving(true);
      setMessage(null);
      const res = await fetch(`/api/sites/${siteId}/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: blocks,
          status: nextStatus ?? status,
          title,
          // The homepage keeps its empty slug; other pages can be renamed.
          ...(page.isHome ? {} : { slug }),
          seo: { title: seoTitle, description: seoDescription },
        }),
      });
      setSaving(false);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "Opslaan mislukt");
        return;
      }
      if (nextStatus) setStatus(nextStatus);
      setDirty(false);
      setMessage(nextStatus === "PUBLISHED" ? "Gepubliceerd" : "Opgeslagen");
    },
    [blocks, siteId, page.id, page.isHome, status, title, slug, seoTitle, seoDescription]
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-100">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/${siteId}/pages`} className="text-sm text-gray-500 hover:underline">
            ← Terug
          </Link>
          <span className="font-semibold text-gray-900">{title}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            {status}
          </span>
          {dirty && <span className="text-xs text-amber-600">• niet opgeslagen</span>}
          {message && <span className="text-xs text-gray-500">{message}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Pagina-instellingen
          </button>
          <button
            onClick={() => setPreview((p) => !p)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            {preview ? "Bewerken" : "Voorbeeld"}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Bekijk live ↗
          </a>
          <button
            onClick={() => save()}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {saving ? "Bezig…" : "Opslaan"}
          </button>
          <button
            onClick={() => save(status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}
            disabled={saving}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {status === "PUBLISHED" ? "Depubliceren" : "Publiceren"}
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {!preview && (
          <aside className="w-64 shrink-0 border-r border-gray-200 bg-white">
            <Palette onAdd={addBlock} />
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-sm">
            <Canvas
              blocks={blocks}
              selectedId={selectedId}
              preview={preview}
              theme={theme}
              onSelect={setSelectedId}
              onRemove={removeBlock}
              onMove={moveBlock}
            />
          </div>
        </main>

        {!preview && (
          <aside className="w-80 shrink-0 border-l border-gray-200 bg-white">
            <Inspector
              block={selectedBlock}
              siteId={siteId}
              onChange={updateField}
              onClose={() => setSelectedId(null)}
            />
          </aside>
        )}
      </div>

      {settingsOpen && (
        <PageSettingsModal
          isHome={page.isHome}
          title={title}
          slug={slug}
          seoTitle={seoTitle}
          seoDescription={seoDescription}
          onChange={(patch) => {
            if (patch.title !== undefined) setTitle(patch.title);
            if (patch.slug !== undefined) setSlug(patch.slug);
            if (patch.seoTitle !== undefined) setSeoTitle(patch.seoTitle);
            if (patch.seoDescription !== undefined) setSeoDescription(patch.seoDescription);
            setDirty(true);
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
