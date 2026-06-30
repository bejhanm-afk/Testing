import Link from "next/link";
import { Providers } from "@/components/providers";
import { getCurrentUser } from "@/lib/authz";
import { SignOutButton } from "@/components/sign-out-button";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="text-lg font-bold text-brand-600">
              SiteBuilder
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  {user.globalRole === "SUPER_ADMIN" && (
                    <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                      Admin
                    </Link>
                  )}
                  <span className="text-gray-400">{user.email}</span>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900">
                    Inloggen
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
                  >
                    Account aanmaken
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </Providers>
  );
}
