import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSuperAdmin, AuthError } from "@/lib/authz";

const schema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  tier: z.enum(["FREE", "PRO", "BUSINESS"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    await requireSuperAdmin();
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });

    if (parsed.data.status) {
      await prisma.site.update({ where: { id: params.siteId }, data: { status: parsed.data.status } });
    }
    if (parsed.data.tier) {
      // Subscription is created with the site, but upsert keeps this robust.
      await prisma.subscription.upsert({
        where: { siteId: params.siteId },
        update: { tier: parsed.data.tier },
        create: { siteId: params.siteId, tier: parsed.data.tier },
      });
    }

    const site = await prisma.site.findUnique({
      where: { id: params.siteId },
      include: { subscription: true },
    });
    return NextResponse.json({ ok: true, site });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
