import type { BlockInstance } from "@/blocks/definitions";

/**
 * Pure, server-renderable block renderer. Given a page's block array it emits
 * the corresponding markup. No client JS required — this is what gets SSR'd for
 * public sites (SEO-friendly) and reused for the builder's live preview.
 */

type Theme = { primary?: string };

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Darken a #rrggbb hex colour toward black by `amt` (0..1). */
function darken(hex: string, amt = 0.4): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.round(((n >> 16) & 255) * (1 - amt));
  const g = Math.round(((n >> 8) & 255) * (1 - amt));
  const b = Math.round((n & 255) * (1 - amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

interface SectionStyle {
  className: string;
  style: React.CSSProperties;
  light: boolean; // text should be light on dark backgrounds
}

/** Resolve a block's `bg` field into container classes/styles + text mode. */
function sectionStyle(bg: string, theme: Theme): SectionStyle {
  const primary = theme.primary ?? "#4f46e5";
  switch (bg) {
    case "licht":
      return { className: "bg-gray-50", style: {}, light: false };
    case "donker":
      return { className: "", style: { backgroundColor: "#0f172a" }, light: true };
    case "merk":
      return { className: "", style: { backgroundColor: primary }, light: true };
    case "kleurverloop":
      return {
        className: "",
        style: { backgroundImage: `linear-gradient(135deg, ${primary} 0%, ${darken(primary, 0.45)} 100%)` },
        light: true,
      };
    default:
      return { className: "bg-white", style: {}, light: false };
  }
}

function HeroBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const align = str(data.align) === "left" ? "text-left items-start" : "text-center items-center";
  const image = str(data.image);
  const sec = sectionStyle(str(data.bg) || "kleurverloop", theme);
  const light = image ? true : sec.light;

  const bgStyle: React.CSSProperties = image
    ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
    : sec.style;

  return (
    <section className={`relative px-6 py-28 ${image ? "" : sec.className}`} style={bgStyle}>
      {image && <div className="absolute inset-0 bg-black/45" />}
      <div className={`relative mx-auto flex max-w-4xl flex-col gap-6 ${align}`}>
        <h1 className={`text-4xl font-extrabold tracking-tight sm:text-6xl ${light ? "text-white" : "text-gray-900"}`}>
          {str(data.heading)}
        </h1>
        <p className={`max-w-2xl text-lg ${light ? "text-white/90" : "text-gray-600"}`}>{str(data.subheading)}</p>
        {str(data.buttonLabel) && (
          <a
            href={str(data.buttonHref) || "#"}
            className="inline-block rounded-xl px-7 py-3.5 font-semibold shadow-lg transition hover:scale-[1.02]"
            style={light ? { backgroundColor: "white", color: theme.primary ?? "#4f46e5" } : { backgroundColor: theme.primary ?? "#4f46e5", color: "white" }}
          >
            {str(data.buttonLabel)}
          </a>
        )}
      </div>
    </section>
  );
}

function TextBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const sec = sectionStyle(str(data.bg) || "wit", theme);
  const center = str(data.align) === "center";
  return (
    <section className={`px-6 py-16 ${sec.className}`} style={sec.style}>
      <div className={`mx-auto max-w-3xl ${center ? "text-center" : ""}`}>
        {str(data.heading) && (
          <h2 className={`mb-4 text-3xl font-bold ${sec.light ? "text-white" : "text-gray-900"}`}>{str(data.heading)}</h2>
        )}
        <p className={`whitespace-pre-line text-lg leading-relaxed ${sec.light ? "text-white/85" : "text-gray-700"}`}>
          {str(data.body)}
        </p>
      </div>
    </section>
  );
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const src = str(data.src);
  if (!src) return null;
  const rounded = str(data.rounded) !== "nee";
  return (
    <figure className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={str(data.alt)} className={`w-full ${rounded ? "rounded-2xl shadow-md" : ""}`} />
        {str(data.caption) && <figcaption className="mt-3 text-center text-sm text-gray-500">{str(data.caption)}</figcaption>}
      </div>
    </figure>
  );
}

function GalleryBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const sec = sectionStyle(str(data.bg) || "wit", theme);
  const images = [data.image1, data.image2, data.image3, data.image4].map(str).filter(Boolean);
  if (images.length === 0) return null;
  const cols = str(data.columns) || "3";
  const colClass = cols === "2" ? "sm:grid-cols-2" : cols === "4" ? "sm:grid-cols-4" : "sm:grid-cols-3";
  return (
    <section className={`px-6 py-16 ${sec.className}`} style={sec.style}>
      <div className="mx-auto max-w-5xl">
        {str(data.heading) && (
          <h2 className={`mb-8 text-center text-3xl font-bold ${sec.light ? "text-white" : "text-gray-900"}`}>{str(data.heading)}</h2>
        )}
        <div className={`grid grid-cols-2 gap-4 ${colClass}`}>
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className="aspect-square w-full rounded-xl object-cover shadow-sm" />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Convert common video URLs into an embeddable form. */
function embedUrl(raw: string): string {
  const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/.exec(raw);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = /vimeo\.com\/(\d+)/.exec(raw);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return raw;
}

function VideoBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const sec = sectionStyle(str(data.bg) || "wit", theme);
  const url = str(data.url);
  return (
    <section className={`px-6 py-16 ${sec.className}`} style={sec.style}>
      <div className="mx-auto max-w-3xl">
        {url ? (
          <div className="aspect-video overflow-hidden rounded-2xl shadow-md">
            <iframe
              src={embedUrl(url)}
              title={str(data.caption) || "Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-gray-300 text-gray-400">
            Voeg een video-URL toe
          </div>
        )}
        {str(data.caption) && (
          <p className={`mt-3 text-center text-sm ${sec.light ? "text-white/80" : "text-gray-500"}`}>{str(data.caption)}</p>
        )}
      </div>
    </section>
  );
}

function FeaturesBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const sec = sectionStyle(str(data.bg) || "licht", theme);
  const items = [1, 2, 3].map((i) => ({
    icon: str(data[`item${i}Icon`]),
    title: str(data[`item${i}Title`]),
    body: str(data[`item${i}Body`]),
  }));
  return (
    <section className={`px-6 py-20 ${sec.className}`} style={sec.style}>
      <div className="mx-auto max-w-5xl">
        {str(data.heading) && (
          <h2 className={`mb-12 text-center text-3xl font-bold ${sec.light ? "text-white" : "text-gray-900"}`}>{str(data.heading)}</h2>
        )}
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100">
              {it.icon && <div className="mb-3 text-3xl">{it.icon}</div>}
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{it.title}</h3>
              <p className="text-gray-600">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const sec = sectionStyle(str(data.bg) || "donker", theme);
  const items = [1, 2, 3].map((i) => ({ value: str(data[`stat${i}Value`]), label: str(data[`stat${i}Label`]) }));
  return (
    <section className={`px-6 py-16 ${sec.className}`} style={sec.style}>
      <div className="mx-auto grid max-w-4xl gap-8 text-center sm:grid-cols-3">
        {items.map((it, i) => (
          <div key={i}>
            <p className={`text-4xl font-extrabold sm:text-5xl ${sec.light ? "text-white" : "text-gray-900"}`}>{it.value}</p>
            <p className={`mt-1 text-sm uppercase tracking-wide ${sec.light ? "text-white/70" : "text-gray-500"}`}>{it.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const sec = sectionStyle(str(data.bg) || "licht", theme);
  const avatar = str(data.avatar);
  return (
    <section className={`px-6 py-20 ${sec.className}`} style={sec.style}>
      <figure className="mx-auto max-w-2xl text-center">
        <blockquote className={`text-2xl font-medium leading-relaxed ${sec.light ? "text-white" : "text-gray-800"}`}>
          “{str(data.quote)}”
        </blockquote>
        <figcaption className="mt-6 flex items-center justify-center gap-3">
          {avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={str(data.author)} className="h-12 w-12 rounded-full object-cover" />
          )}
          <div className="text-left">
            <p className={`font-semibold ${sec.light ? "text-white" : "text-gray-900"}`}>{str(data.author)}</p>
            <p className={`text-sm ${sec.light ? "text-white/70" : "text-gray-500"}`}>{str(data.role)}</p>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}

function CtaBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const sec = sectionStyle(str(data.bg) || "merk", theme);
  return (
    <section className={`px-6 py-20 ${sec.className}`} style={sec.style}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className={`text-3xl font-bold sm:text-4xl ${sec.light ? "text-white" : "text-gray-900"}`}>{str(data.heading)}</h2>
        {str(data.body) && <p className={`mt-3 text-lg ${sec.light ? "text-white/85" : "text-gray-600"}`}>{str(data.body)}</p>}
        {str(data.buttonLabel) && (
          <a
            href={str(data.buttonHref) || "#"}
            className="mt-7 inline-block rounded-xl px-7 py-3.5 font-semibold shadow-lg transition hover:scale-[1.02]"
            style={sec.light ? { backgroundColor: "white", color: theme.primary ?? "#4f46e5" } : { backgroundColor: theme.primary ?? "#4f46e5", color: "white" }}
          >
            {str(data.buttonLabel)}
          </a>
        )}
      </div>
    </section>
  );
}

function ButtonBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const primary = str(data.variant) !== "secondary";
  const align = str(data.align);
  const justify = align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  return (
    <div className={`px-6 py-8 ${justify}`}>
      <a
        href={str(data.href) || "#"}
        className="inline-block rounded-xl px-6 py-3 font-medium transition hover:scale-[1.02]"
        style={
          primary
            ? { backgroundColor: theme.primary ?? "#4f46e5", color: "white" }
            : { border: `1px solid ${theme.primary ?? "#4f46e5"}`, color: theme.primary ?? "#4f46e5" }
        }
      >
        {str(data.label)}
      </a>
    </div>
  );
}

function DividerBlock({ data }: { data: Record<string, unknown> }) {
  const size = str(data.size);
  const pad = size === "klein" ? "py-4" : size === "groot" ? "py-16" : "py-9";
  if (str(data.style) === "ruimte") return <div className={pad} />;
  return (
    <div className={`px-6 ${pad}`}>
      <hr className="mx-auto max-w-4xl border-gray-200" />
    </div>
  );
}

function ContactFormBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const sec = sectionStyle(str(data.bg) || "licht", theme);
  return (
    <section className={`px-6 py-20 ${sec.className}`} style={sec.style}>
      <div className="mx-auto max-w-xl">
        <h2 className={`mb-6 text-center text-3xl font-bold ${sec.light ? "text-white" : "text-gray-900"}`}>{str(data.heading)}</h2>
        <form className="flex flex-col gap-4">
          <input className="rounded-lg border border-gray-300 px-4 py-3" placeholder="Naam" />
          <input className="rounded-lg border border-gray-300 px-4 py-3" placeholder="E-mail" type="email" />
          <textarea className="rounded-lg border border-gray-300 px-4 py-3" placeholder="Bericht" rows={4} />
          <button
            type="submit"
            className="rounded-xl px-6 py-3.5 font-semibold text-white shadow-lg transition hover:scale-[1.01]"
            style={{ backgroundColor: theme.primary ?? "#4f46e5" }}
          >
            {str(data.buttonLabel) || "Versturen"}
          </button>
        </form>
      </div>
    </section>
  );
}

const RENDERERS: Record<
  string,
  (props: { data: Record<string, unknown>; theme: Theme }) => JSX.Element | null
> = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  video: VideoBlock,
  features: FeaturesBlock,
  stats: StatsBlock,
  testimonial: TestimonialBlock,
  cta: CtaBlock,
  button: ButtonBlock,
  divider: DividerBlock,
  contactForm: ContactFormBlock,
};

export function BlockRenderer({
  block,
  theme = {},
}: {
  block: BlockInstance;
  theme?: Theme;
}) {
  const Cmp = RENDERERS[block.type];
  if (!Cmp) return null;
  return <Cmp data={block.data ?? {}} theme={theme} />;
}

export function PageRenderer({
  blocks,
  theme = {},
}: {
  blocks: BlockInstance[];
  theme?: Theme;
}) {
  return (
    <>
      {blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} theme={theme} />
      ))}
    </>
  );
}
