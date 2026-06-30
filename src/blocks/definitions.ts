/**
 * Block catalogue — the single source of truth for which block *types* exist,
 * what fields they expose, and their default content. Used by:
 *   - the database seed (populates the Block table)
 *   - the page-builder palette + inspector (renders fields from `schema`)
 *   - the renderer (maps `type` -> React component)
 *
 * A Page stores an array of block *instances*: { id, type, data }.
 */

export type FieldType = "text" | "textarea" | "image" | "url" | "color" | "select";

export interface BlockField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select
}

export interface BlockDefinition {
  type: string;
  name: string;
  category: string;
  icon: string;
  fields: BlockField[];
  defaultData: Record<string, unknown>;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "hero",
    name: "Hero",
    category: "Layout",
    icon: "✨",
    fields: [
      { key: "heading", label: "Kop", type: "text" },
      { key: "subheading", label: "Subkop", type: "textarea" },
      { key: "buttonLabel", label: "Knoptekst", type: "text" },
      { key: "buttonHref", label: "Knop-link", type: "url" },
      { key: "image", label: "Achtergrondafbeelding", type: "image" },
      { key: "align", label: "Uitlijning", type: "select", options: ["left", "center"] },
    ],
    defaultData: {
      heading: "Welkom op je nieuwe website",
      subheading: "Bouw in minuten een professionele site, zonder code.",
      buttonLabel: "Aan de slag",
      buttonHref: "#",
      image: "",
      align: "center",
    },
  },
  {
    type: "text",
    name: "Tekst",
    category: "Content",
    icon: "¶",
    fields: [
      { key: "heading", label: "Kop", type: "text" },
      { key: "body", label: "Tekst", type: "textarea" },
    ],
    defaultData: {
      heading: "Een kop",
      body: "Schrijf hier je verhaal. Dit blok is volledig aanpasbaar.",
    },
  },
  {
    type: "image",
    name: "Afbeelding",
    category: "Media",
    icon: "🖼",
    fields: [
      { key: "src", label: "Afbeelding", type: "image" },
      { key: "alt", label: "Alt-tekst", type: "text" },
      { key: "caption", label: "Bijschrift", type: "text" },
    ],
    defaultData: { src: "", alt: "", caption: "" },
  },
  {
    type: "features",
    name: "Kenmerken",
    category: "Content",
    icon: "▦",
    fields: [
      { key: "heading", label: "Kop", type: "text" },
      { key: "item1Title", label: "Kenmerk 1 — titel", type: "text" },
      { key: "item1Body", label: "Kenmerk 1 — tekst", type: "textarea" },
      { key: "item2Title", label: "Kenmerk 2 — titel", type: "text" },
      { key: "item2Body", label: "Kenmerk 2 — tekst", type: "textarea" },
      { key: "item3Title", label: "Kenmerk 3 — titel", type: "text" },
      { key: "item3Body", label: "Kenmerk 3 — tekst", type: "textarea" },
    ],
    defaultData: {
      heading: "Waarom kiezen voor ons",
      item1Title: "Snel",
      item1Body: "In een handomdraai online.",
      item2Title: "Flexibel",
      item2Body: "Pas alles aan naar wens.",
      item3Title: "Betrouwbaar",
      item3Body: "Altijd en overal bereikbaar.",
    },
  },
  {
    type: "button",
    name: "Knop",
    category: "Content",
    icon: "⬢",
    fields: [
      { key: "label", label: "Tekst", type: "text" },
      { key: "href", label: "Link", type: "url" },
      { key: "variant", label: "Stijl", type: "select", options: ["primary", "secondary"] },
    ],
    defaultData: { label: "Klik hier", href: "#", variant: "primary" },
  },
  {
    type: "contactForm",
    name: "Contactformulier",
    category: "Forms",
    icon: "✉",
    fields: [
      { key: "heading", label: "Kop", type: "text" },
      { key: "buttonLabel", label: "Verzendknop", type: "text" },
    ],
    defaultData: { heading: "Neem contact op", buttonLabel: "Versturen" },
  },
];

export const BLOCK_MAP: Record<string, BlockDefinition> = Object.fromEntries(
  BLOCK_DEFINITIONS.map((b) => [b.type, b])
);

export interface BlockInstance {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

/** Create a fresh instance with defaults for a given block type. */
export function createBlockInstance(type: string): BlockInstance {
  const def = BLOCK_MAP[type];
  if (!def) throw new Error(`Unknown block type: ${type}`);
  return {
    id: `${type}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    data: { ...def.defaultData },
  };
}
