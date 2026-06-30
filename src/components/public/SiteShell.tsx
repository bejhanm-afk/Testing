import Link from "next/link";

export interface NavItem {
  title: string;
  href: string;
}

/**
 * Public site chrome: a header with the site name + navigation across the
 * site's published pages, and a simple footer. Rendered server-side around the
 * page blocks so every tenant page shares consistent navigation.
 */
export function SiteShell({
  siteName,
  nav,
  theme,
  currentHref,
  children,
}: {
  siteName: string;
  nav: NavItem[];
  theme: { primary?: string };
  currentHref: string;
  children: React.ReactNode;
}) {
  const primary = theme.primary ?? "#4f46e5";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold" style={{ color: primary }}>
            {siteName}
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            {nav.map((item) => {
              const active = item.href === currentHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 transition hover:text-gray-900"
                  style={active ? { color: primary, fontWeight: 600 } : undefined}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-gray-500">
          © {new Date().getFullYear()} {siteName}
        </div>
      </footer>
    </div>
  );
}
