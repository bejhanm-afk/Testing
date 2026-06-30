"use client";

import { useRef } from "react";
import { BlockRenderer, PageRenderer } from "@/blocks/Renderer";
import type { BlockInstance } from "@/blocks/definitions";

type Theme = { primary?: string };

export function Canvas({
  blocks,
  selectedId,
  preview,
  theme,
  onSelect,
  onRemove,
  onMove,
}: {
  blocks: BlockInstance[];
  selectedId: string | null;
  preview: boolean;
  theme: Theme;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
}) {
  const dragIndex = useRef<number | null>(null);

  if (preview) {
    return (
      <div className="min-h-full bg-white">
        <PageRenderer blocks={blocks} theme={theme} />
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-10 text-center text-gray-400">
        Voeg links een blok toe om te beginnen.
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      {blocks.map((block, index) => {
        const selected = block.id === selectedId;
        return (
          <div
            key={block.id}
            draggable
            onDragStart={() => (dragIndex.current = index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex.current !== null && dragIndex.current !== index) {
                onMove(dragIndex.current, index);
              }
              dragIndex.current = null;
            }}
            onClick={() => onSelect(block.id)}
            className={`group relative cursor-pointer border-2 transition ${
              selected ? "border-brand-500" : "border-transparent hover:border-brand-200"
            }`}
          >
            {/* Toolbar */}
            <div
              className={`absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md bg-gray-900/80 p-1 text-white opacity-0 transition group-hover:opacity-100 ${
                selected ? "opacity-100" : ""
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                title="Omhoog"
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
                className="px-1.5 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                title="Omlaag"
                disabled={index === blocks.length - 1}
                onClick={() => onMove(index, index + 1)}
                className="px-1.5 disabled:opacity-30"
              >
                ↓
              </button>
              <span className="cursor-grab px-1.5" title="Sleep om te verplaatsen">
                ⠿
              </span>
              <button
                title="Verwijderen"
                onClick={() => onRemove(block.id)}
                className="px-1.5 text-red-300 hover:text-red-100"
              >
                🗑
              </button>
            </div>

            {/* Non-interactive render so clicks select the block instead of
                following links inside it. */}
            <div className="pointer-events-none">
              <BlockRenderer block={block} theme={theme} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
