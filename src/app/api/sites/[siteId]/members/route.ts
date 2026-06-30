import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";

const addSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "EDITOR"]).default("EDITOR"),
});

export async function GET(
  _req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "OWNER");
    const members = await prisma.membership.findMany({
      where: { siteId: params.siteId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ members });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "OWNER");

    const body = await req.json().catch(() => null);
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) {
      return NextResponse.json(
        { error: "Geen gebruiker met dit e-mailadres. Vraag ze eerst een account aan te maken." },
        { status: 404 }
      );
    }

    const existing = await prisma.membership.findUnique({
      where: { userId_siteId: { userId: user.id, siteId: params.siteId } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "Deze gebruiker is al lid van de site" }, { status: 409 });
    }

    const member = await prisma.membership.create({
      data: { userId: user.id, siteId: params.siteId, role: parsed.data.role },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    return NextResponse.json({ ok: true, member }, { status: 201 });
  } catch (e) {
    return handle(e);
  }
}

function handle(e: unknown) {
  if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  throw e;
}
