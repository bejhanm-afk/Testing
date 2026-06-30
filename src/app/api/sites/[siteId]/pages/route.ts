import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { normalizeSlug } from "@/lib/slug";

const createSchema = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().max(160).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "EDITOR");
    const pages = await prisma.page.findMany({
      where: { siteId: params.siteId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ pages });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "EDITOR");
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
    }

    const slug = normalizeSlug(parsed.data.slug ?? parsed.data.title);
    const clash = await prisma.page.findFirst({
      where: { siteId: params.siteId, slug },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json({ error: "Er bestaat al een pagina met deze slug" }, { status: 409 });
    }

    const page = await prisma.page.create({
      data: {
        siteId: params.siteId,
        title: parsed.data.title,
        slug,
        content: [],
        status: "DRAFT",
      },
    });
    return NextResponse.json({ ok: true, page }, { status: 201 });
  } catch (e) {
    return handle(e);
  }
}

function handle(e: unknown) {
  if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  throw e;
}
