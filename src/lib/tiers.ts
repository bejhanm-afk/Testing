import type { Tier } from "@prisma/client";

/**
 * SaaS plan definitions. Billing is stubbed (no payment provider): a tier is
 * just a value on Subscription that admins set and owners can "switch" via a
 * mock upgrade. The limits below are enforced for real in the API.
 */

export interface TierPlan {
  tier: Tier;
  label: string;
  priceLabel: string;
  maxPages: number; // Infinity = unlimited
  features: string[];
}

export const TIER_PLANS: Record<Tier, TierPlan> = {
  FREE: {
    tier: "FREE",
    label: "Gratis",
    priceLabel: "€0 / maand",
    maxPages: 5,
    features: ["1 site", "Tot 5 pagina's", "Subdomein", "Community-support"],
  },
  PRO: {
    tier: "PRO",
    label: "Pro",
    priceLabel: "€12 / maand",
    maxPages: 25,
    features: ["Tot 25 pagina's", "Custom domain", "Verwijder branding", "E-mailsupport"],
  },
  BUSINESS: {
    tier: "BUSINESS",
    label: "Business",
    priceLabel: "€39 / maand",
    maxPages: Infinity,
    features: ["Onbeperkt pagina's", "Custom domain", "Prioriteitssupport", "Team-rollen"],
  },
};

export const ORDERED_TIERS: Tier[] = ["FREE", "PRO", "BUSINESS"];

export function planFor(tier: Tier | null | undefined): TierPlan {
  return TIER_PLANS[tier ?? "FREE"];
}
