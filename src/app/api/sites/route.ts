import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, AuthError, listAccessibleSites } from "@/lib/authz";
import { normalizeSubdomain, isReservedSubdomain } from "@/lib/host";
import type { Prisma } from "@prisma/client";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  subdomain: z.string().min(2).max(63),
  templateId: z.string().optional(),
});

export async function GET() {
  try {
    const sites = await listAccessibleSites();
    return NextResponse.json({ sites });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

type TemplatePage = { title: string; slug: string; content: unknown };

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer", issues: parsed.error.flatten() }, { status: 400 });
    }

    const subdomain = normalizeSubdomain(parsed.data.subdomain);
    if (!subdomain || isReservedSubdomain(subdomain)) {
      return NextResponse.json({ error: "Subdomein is ongeldig of gereserveerd" }, { status: 400 });
    }

    const taken = await prisma.site.findUnique({ where: { subdomain } });
    if (taken) {
      return NextResponse.json({ error: "Dit subdomein is al in gebruik" }, { status: 409 });
    }

    // Resolve the chosen template's pages (if any).
    let pages: TemplatePage[] = [{ title: "Home", slug: "", content: [] }];
    if (parsed.data.templateId) {
      const template = await prisma.template.findUnique({ where: { id: parsed.data.templateId } });
      const structure = template?.structure as { pages?: TemplatePage[] } | null;
      if (structure?.pages?.length) pages = structure.pages;
    }

    const site = await prisma.site.create({
      data: {
        name: parsed.data.name,
        subdomain,
        templateId: parsed.data.templateId ?? null,
        theme: { primary: "#4f46e5" },
        memberships: { create: { userId: user.id, role: "OWNER" } },
        subscription: { create: { tier: "FREE" } },
        pages: {
          create: pages.map((p, i) => ({
            title: p.title,
            slug: normalizeSlug(p.slug),
            isHome: i === 0 || p.slug === "",
            status: "PUBLISHED",
            publishedAt: new Date(),
            content: (p.content ?? []) as Prisma.InputJsonValue,
          })),
        },
      },
      select: { id: true, name: true, subdomain: true },
    });

    return NextResponse.json({ ok: true, site }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
