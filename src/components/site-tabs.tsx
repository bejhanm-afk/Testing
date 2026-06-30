import Link from "next/link";

export function SiteTabs({
  siteId,
  active,
}: {
  siteId: string;
  active: "pages" | "settings";
}) {
  const tabs = [
    { key: "pages", label: "Pagina's", href: `/dashboard/${siteId}/pages` },
    { key: "settings", label: "Instellingen", href: `/dashboard/${siteId}/settings` },
  ] as const;

  return (
    <nav className="mb-6 flex gap-1 border-b border-gray-200">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
            active === t.key
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
