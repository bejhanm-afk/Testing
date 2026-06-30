import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";

const schema = z.object({ tier: z.enum(["FREE", "PRO", "BUSINESS"]) });

/**
 * Mock "checkout": billing is stubbed, so switching plans simply updates the
 * subscription tier without any payment provider. In production this would
 * create a Stripe Checkout session and the tier would change on webhook.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "OWNER");
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });

    const subscription = await prisma.subscription.upsert({
      where: { siteId: params.siteId },
      update: { tier: parsed.data.tier },
      create: { siteId: params.siteId, tier: parsed.data.tier },
    });
    return NextResponse.json({ ok: true, subscription });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
