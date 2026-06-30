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

function HeroBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const align = str(data.align) === "left" ? "text-left items-start" : "text-center items-center";
  const image = str(data.image);
  return (
    <section
      className="relative px-6 py-24"
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {image && <div className="absolute inset-0 bg-black/40" />}
      <div className={`relative mx-auto flex max-w-4xl flex-col gap-5 ${align}`}>
        <h1 className={`text-4xl font-bold sm:text-5xl ${image ? "text-white" : "text-gray-900"}`}>
          {str(data.heading)}
        </h1>
        <p className={`max-w-2xl text-lg ${image ? "text-gray-100" : "text-gray-600"}`}>
          {str(data.subheading)}
        </p>
        {str(data.buttonLabel) && (
          <a
            href={str(data.buttonHref) || "#"}
            className="inline-block rounded-lg px-6 py-3 font-medium text-white"
            style={{ backgroundColor: theme.primary ?? "#4f46e5" }}
          >
            {str(data.buttonLabel)}
          </a>
        )}
      </div>
    </section>
  );
}

function TextBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {str(data.heading) && <h2 className="mb-4 text-2xl font-semibold text-gray-900">{str(data.heading)}</h2>}
        <p className="whitespace-pre-line leading-relaxed text-gray-700">{str(data.body)}</p>
      </div>
    </section>
  );
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const src = str(data.src);
  if (!src) return null;
  return (
    <figure className="px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={str(data.alt)} className="w-full rounded-lg" />
        {str(data.caption) && <figcaption className="mt-2 text-center text-sm text-gray-500">{str(data.caption)}</figcaption>}
      </div>
    </figure>
  );
}

function FeaturesBlock({ data }: { data: Record<string, unknown> }) {
  const items = [1, 2, 3].map((i) => ({
    title: str(data[`item${i}Title`]),
    body: str(data[`item${i}Body`]),
  }));
  return (
    <section className="bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {str(data.heading) && <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">{str(data.heading)}</h2>}
        <div className="grid gap-8 sm:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{it.title}</h3>
              <p className="text-gray-600">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ButtonBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  const primary = str(data.variant) !== "secondary";
  return (
    <div className="px-6 py-8 text-center">
      <a
        href={str(data.href) || "#"}
        className="inline-block rounded-lg px-6 py-3 font-medium"
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

function ContactFormBlock({ data, theme }: { data: Record<string, unknown>; theme: Theme }) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-xl">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900">{str(data.heading)}</h2>
        <form className="flex flex-col gap-4">
          <input className="rounded-lg border border-gray-300 px-4 py-2" placeholder="Naam" />
          <input className="rounded-lg border border-gray-300 px-4 py-2" placeholder="E-mail" type="email" />
          <textarea className="rounded-lg border border-gray-300 px-4 py-2" placeholder="Bericht" rows={4} />
          <button
            type="submit"
            className="rounded-lg px-6 py-3 font-medium text-white"
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
  features: FeaturesBlock,
  button: ButtonBlock,
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
