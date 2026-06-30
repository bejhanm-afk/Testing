"use client";

import { useState } from "react";
import { BLOCK_MAP, type BlockInstance, type BlockField } from "@/blocks/definitions";
import { MediaPickerModal } from "@/components/media/MediaPickerModal";

function ImageField({
  siteId,
  value,
  onChange,
}: {
  siteId: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const base = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-2">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-24 w-full rounded-lg border border-gray-200 object-cover" />
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
        >
          Kies uit media
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Verwijderen
          </button>
        )}
      </div>
      <input
        type="url"
        placeholder="of plak een URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
      {pickerOpen && (
        <MediaPickerModal siteId={siteId} onSelect={onChange} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  );
}

function FieldInput({
  field,
  value,
  siteId,
  onChange,
}: {
  field: BlockField;
  value: string;
  siteId: string;
  onChange: (v: string) => void;
}) {
  const base = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      );
    case "select":
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={base}>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "color":
      return (
        <input
          type="color"
          value={value || "#4f46e5"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-16 rounded border border-gray-300"
        />
      );
    case "image":
      return <ImageField siteId={siteId} value={value} onChange={onChange} />;
    default:
      return (
        <input
          type={field.type === "url" ? "url" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      );
  }
}

export function Inspector({
  block,
  siteId,
  onChange,
  onClose,
}: {
  block: BlockInstance | null;
  siteId: string;
  onChange: (key: string, value: string) => void;
  onClose: () => void;
}) {
  if (!block) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Selecteer een blok om de inhoud te bewerken.
      </div>
    );
  }

  const def = BLOCK_MAP[block.type];
  if (!def) return <div className="p-4 text-sm text-red-600">Onbekend blok.</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <span className="text-sm font-semibold text-gray-900">
          {def.icon} {def.name}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Sluiten">
          ✕
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {def.fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-xs font-medium text-gray-600">{field.label}</label>
            <FieldInput
              field={field}
              siteId={siteId}
              value={typeof block.data[field.key] === "string" ? (block.data[field.key] as string) : ""}
              onChange={(v) => onChange(field.key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
