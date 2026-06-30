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

/** Shared background-style picker reused across section blocks. */
export const BG_OPTIONS = ["wit", "licht", "donker", "merk", "kleurverloop"];
const BG_FIELD: BlockField = { key: "bg", label: "Achtergrond", type: "select", options: BG_OPTIONS };

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
      BG_FIELD,
    ],
    defaultData: {
      heading: "Welkom op je nieuwe website",
      subheading: "Bouw in minuten een professionele site, zonder code.",
      buttonLabel: "Aan de slag",
      buttonHref: "#",
      image: "",
      align: "center",
      bg: "kleurverloop",
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
      { key: "align", label: "Uitlijning", type: "select", options: ["left", "center"] },
      BG_FIELD,
    ],
    defaultData: {
      heading: "Een kop",
      body: "Schrijf hier je verhaal. Dit blok is volledig aanpasbaar.",
      align: "left",
      bg: "wit",
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
      { key: "rounded", label: "Ronde hoeken", type: "select", options: ["ja", "nee"] },
    ],
    defaultData: { src: "", alt: "", caption: "", rounded: "ja" },
  },
  {
    type: "gallery",
    name: "Galerij",
    category: "Media",
    icon: "🖼🖼",
    fields: [
      { key: "heading", label: "Kop", type: "text" },
      { key: "image1", label: "Afbeelding 1", type: "image" },
      { key: "image2", label: "Afbeelding 2", type: "image" },
      { key: "image3", label: "Afbeelding 3", type: "image" },
      { key: "image4", label: "Afbeelding 4", type: "image" },
      { key: "columns", label: "Kolommen", type: "select", options: ["2", "3", "4"] },
      BG_FIELD,
    ],
    defaultData: { heading: "", image1: "", image2: "", image3: "", image4: "", columns: "3", bg: "wit" },
  },
  {
    type: "video",
    name: "Video",
    category: "Media",
    icon: "▶",
    fields: [
      { key: "url", label: "Video-URL (YouTube/Vimeo)", type: "url" },
      { key: "caption", label: "Bijschrift", type: "text" },
      BG_FIELD,
    ],
    defaultData: { url: "", caption: "", bg: "wit" },
  },
  {
    type: "features",
    name: "Kenmerken",
    category: "Content",
    icon: "▦",
    fields: [
      { key: "heading", label: "Kop", type: "text" },
      { key: "item1Icon", label: "Kenmerk 1 — icoon", type: "text" },
      { key: "item1Title", label: "Kenmerk 1 — titel", type: "text" },
      { key: "item1Body", label: "Kenmerk 1 — tekst", type: "textarea" },
      { key: "item2Icon", label: "Kenmerk 2 — icoon", type: "text" },
      { key: "item2Title", label: "Kenmerk 2 — titel", type: "text" },
      { key: "item2Body", label: "Kenmerk 2 — tekst", type: "textarea" },
      { key: "item3Icon", label: "Kenmerk 3 — icoon", type: "text" },
      { key: "item3Title", label: "Kenmerk 3 — titel", type: "text" },
      { key: "item3Body", label: "Kenmerk 3 — tekst", type: "textarea" },
      BG_FIELD,
    ],
    defaultData: {
      heading: "Waarom kiezen voor ons",
      item1Icon: "⚡", item1Title: "Snel", item1Body: "In een handomdraai online.",
      item2Icon: "🎨", item2Title: "Flexibel", item2Body: "Pas alles aan naar wens.",
      item3Icon: "🔒", item3Title: "Betrouwbaar", item3Body: "Altijd en overal bereikbaar.",
      bg: "licht",
    },
  },
  {
    type: "stats",
    name: "Statistieken",
    category: "Content",
    icon: "📊",
    fields: [
      { key: "stat1Value", label: "Cijfer 1", type: "text" },
      { key: "stat1Label", label: "Label 1", type: "text" },
      { key: "stat2Value", label: "Cijfer 2", type: "text" },
      { key: "stat2Label", label: "Label 2", type: "text" },
      { key: "stat3Value", label: "Cijfer 3", type: "text" },
      { key: "stat3Label", label: "Label 3", type: "text" },
      BG_FIELD,
    ],
    defaultData: {
      stat1Value: "10k+", stat1Label: "Klanten",
      stat2Value: "99,9%", stat2Label: "Uptime",
      stat3Value: "24/7", stat3Label: "Support",
      bg: "donker",
    },
  },
  {
    type: "testimonial",
    name: "Testimonial",
    category: "Content",
    icon: "❝",
    fields: [
      { key: "quote", label: "Citaat", type: "textarea" },
      { key: "author", label: "Naam", type: "text" },
      { key: "role", label: "Functie / bedrijf", type: "text" },
      { key: "avatar", label: "Foto", type: "image" },
      BG_FIELD,
    ],
    defaultData: {
      quote: "Dit platform heeft onze online aanwezigheid compleet veranderd. Aanrader!",
      author: "Jane Doe",
      role: "Oprichter, Voorbeeld BV",
      avatar: "",
      bg: "licht",
    },
  },
  {
    type: "cta",
    name: "Call-to-action",
    category: "Content",
    icon: "📣",
    fields: [
      { key: "heading", label: "Kop", type: "text" },
      { key: "body", label: "Tekst", type: "textarea" },
      { key: "buttonLabel", label: "Knoptekst", type: "text" },
      { key: "buttonHref", label: "Knop-link", type: "url" },
      BG_FIELD,
    ],
    defaultData: {
      heading: "Klaar om te beginnen?",
      body: "Zet vandaag nog je eerste stap.",
      buttonLabel: "Start nu",
      buttonHref: "#",
      bg: "merk",
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
      { key: "align", label: "Uitlijning", type: "select", options: ["left", "center", "right"] },
    ],
    defaultData: { label: "Klik hier", href: "#", variant: "primary", align: "center" },
  },
  {
    type: "divider",
    name: "Scheiding",
    category: "Layout",
    icon: "─",
    fields: [
      { key: "style", label: "Type", type: "select", options: ["lijn", "ruimte"] },
      { key: "size", label: "Grootte", type: "select", options: ["klein", "middel", "groot"] },
    ],
    defaultData: { style: "lijn", size: "middel" },
  },
  {
    type: "contactForm",
    name: "Contactformulier",
    category: "Forms",
    icon: "✉",
    fields: [
      { key: "heading", label: "Kop", type: "text" },
      { key: "buttonLabel", label: "Verzendknop", type: "text" },
      BG_FIELD,
    ],
    defaultData: { heading: "Neem contact op", buttonLabel: "Versturen", bg: "licht" },
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
