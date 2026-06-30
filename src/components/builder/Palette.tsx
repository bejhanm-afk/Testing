"use client";

import { BLOCK_DEFINITIONS } from "@/blocks/definitions";

/** Group block definitions by category for the palette. */
const GROUPS = BLOCK_DEFINITIONS.reduce<Record<string, typeof BLOCK_DEFINITIONS>>(
  (acc, def) => {
    (acc[def.category] ??= []).push(def);
    return acc;
  },
  {}
);

export function Palette({ onAdd }: { onAdd: (type: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
        Blokken
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {Object.entries(GROUPS).map(([category, blocks]) => (
          <div key={category}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              {category}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {blocks.map((def) => (
                <button
                  key={def.type}
                  onClick={() => onAdd(def.type)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-3 text-center text-xs text-gray-700 transition hover:border-brand-400 hover:bg-brand-50"
                >
                  <span className="text-xl">{def.icon}</span>
                  {def.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
