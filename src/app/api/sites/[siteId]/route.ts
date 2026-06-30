import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import type { Prisma } from "@prisma/client";

const hostnameRe = /^([a-z0-9-]+\.)+[a-z]{2,}$/;

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  customDomain: z
    .string()
    .trim()
    .toLowerCase()
    .max(253)
    .refine((v) => v === "" || hostnameRe.test(v), "Ongeldig domein")
    .optional(),
  theme: z.object({ primary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional() }).optional(),
  seo: z
    .object({
      title: z.string().max(160).optional(),
      description: z.string().max(320).optional(),
    })
    .optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    // Settings (domain, branding, SEO) are an owner-level concern.
    await assertSiteAccess(params.siteId, "OWNER");

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer", issues: parsed.error.flatten() }, { status: 400 });
    }

    const data: Prisma.SiteUpdateInput = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.theme !== undefined) data.theme = parsed.data.theme as Prisma.InputJsonValue;
    if (parsed.data.seo !== undefined) data.seo = parsed.data.seo as Prisma.InputJsonValue;

    if (parsed.data.customDomain !== undefined) {
      const domain = parsed.data.customDomain;
      if (domain === "") {
        data.customDomain = null;
      } else {
        const clash = await prisma.site.findFirst({
          where: { customDomain: domain, id: { not: params.siteId } },
          select: { id: true },
        });
        if (clash) return NextResponse.json({ error: "Dit domein is al gekoppeld aan een andere site" }, { status: 409 });
        data.customDomain = domain;
      }
    }

    const site = await prisma.site.update({ where: { id: params.siteId }, data });
    return NextResponse.json({ ok: true, site });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
