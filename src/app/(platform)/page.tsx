import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/authz";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
        Bouw je website. Zonder code.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
        Kies een template, sleep blokken op hun plek en publiceer op je eigen
        subdomein. Een modern, multi-tenant alternatief voor WordPress.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/register"
          className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
        >
          Gratis beginnen
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-100"
        >
          Inloggen
        </Link>
      </div>
    </div>
  );
}
