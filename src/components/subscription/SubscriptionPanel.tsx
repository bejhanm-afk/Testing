"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TIER_PLANS, ORDERED_TIERS } from "@/lib/tiers";
import type { Tier } from "@prisma/client";

export function SubscriptionPanel({
  siteId,
  currentTier,
  pageCount,
}: {
  siteId: string;
  currentTier: Tier;
  pageCount: number;
}) {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>(currentTier);
  const [busy, setBusy] = useState<Tier | null>(null);

  async function choose(next: Tier) {
    if (next === tier) return;
    setBusy(next);
    const res = await fetch(`/api/sites/${siteId}/subscription`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: next }),
    });
    setBusy(null);
    if (res.ok) {
      setTier(next);
      router.refresh();
    } else {
      alert("Wijzigen mislukt");
    }
  }

  const max = TIER_PLANS[tier].maxPages;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">Huidig gebruik</p>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {pageCount} {Number.isFinite(max) ? `/ ${max}` : ""} pagina&apos;s
          <span className="ml-2 text-sm font-normal text-gray-500">op het {TIER_PLANS[tier].label}-plan</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ORDERED_TIERS.map((t) => {
          const plan = TIER_PLANS[t];
          const isCurrent = t === tier;
          return (
            <div
              key={t}
              className={`flex flex-col rounded-xl border bg-white p-6 ${
                isCurrent ? "border-brand-500 ring-2 ring-brand-100" : "border-gray-200"
              }`}
            >
              <h3 className="text-lg font-bold text-gray-900">{plan.label}</h3>
              <p className="mt-1 text-sm text-gray-500">{plan.priceLabel}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-600">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-brand-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={isCurrent || busy !== null}
                onClick={() => choose(t)}
                className={`mt-5 rounded-lg px-4 py-2 text-sm font-medium ${
                  isCurrent
                    ? "cursor-default bg-gray-100 text-gray-500"
                    : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
                }`}
              >
                {isCurrent ? "Huidig plan" : busy === t ? "Bezig…" : "Kies dit plan"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400">
        Betalingen zijn in deze omgeving uitgeschakeld — een planwijziging wordt direct toegepast (mock-checkout).
        In productie zou dit een Stripe Checkout-sessie starten.
      </p>
    </div>
  );
}
