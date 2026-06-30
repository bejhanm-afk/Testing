import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { normalizeSlug } from "@/lib/slug";
import { BLOCK_MAP } from "@/blocks/definitions";
import type { Prisma } from "@prisma/client";

const blockSchema = z.object({
  id: z.string().min(1),
  type: z.string().refine((t) => t in BLOCK_MAP, "Onbekend blocktype"),
  data: z.record(z.unknown()),
});

const seoSchema = z.object({
  title: z.string().max(160).optional(),
  description: z.string().max(320).optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  slug: z.string().max(160).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  content: z.array(blockSchema).optional(),
  seo: seoSchema.optional(),
});

async function loadOwnedPage(siteId: string, pageId: string) {
  const page = await prisma.page.findFirst({ where: { id: pageId, siteId } });
  return page;
}

export async function GET(
  _req: Request,
  { params }: { params: { siteId: string; pageId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "EDITOR");
    const page = await loadOwnedPage(params.siteId, params.pageId);
    if (!page) return NextResponse.json({ error: "Pagina niet gevonden" }, { status: 404 });
    return NextResponse.json({ page });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { siteId: string; pageId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "EDITOR");
    const existing = await loadOwnedPage(params.siteId, params.pageId);
    if (!existing) return NextResponse.json({ error: "Pagina niet gevonden" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer", issues: parsed.error.flatten() }, { status: 400 });
    }

    const data: Prisma.PageUpdateInput = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.content !== undefined) data.content = parsed.data.content as Prisma.InputJsonValue;
    if (parsed.data.seo !== undefined) data.seo = parsed.data.seo as Prisma.InputJsonValue;

    if (parsed.data.slug !== undefined) {
      const slug = normalizeSlug(parsed.data.slug);
      if (slug !== existing.slug) {
        const clash = await prisma.page.findFirst({
          where: { siteId: params.siteId, slug, id: { not: existing.id } },
          select: { id: true },
        });
        if (clash) return NextResponse.json({ error: "Slug al in gebruik" }, { status: 409 });
      }
      data.slug = slug;
    }

    if (parsed.data.status !== undefined) {
      data.status = parsed.data.status;
      data.publishedAt =
        parsed.data.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : null;
    }

    const page = await prisma.page.update({ where: { id: existing.id }, data });
    return NextResponse.json({ ok: true, page });
  } catch (e) {
    return handle(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { siteId: string; pageId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "EDITOR");
    const existing = await loadOwnedPage(params.siteId, params.pageId);
    if (!existing) return NextResponse.json({ error: "Pagina niet gevonden" }, { status: 404 });
    if (existing.isHome) {
      return NextResponse.json({ error: "De homepagina kan niet verwijderd worden" }, { status: 400 });
    }
    await prisma.page.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

function handle(e: unknown) {
  if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  throw e;
}
