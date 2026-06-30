import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";

const patchSchema = z.object({ role: z.enum(["OWNER", "EDITOR"]) });

/** A site must always keep at least one owner. */
async function ownerCount(siteId: string) {
  return prisma.membership.count({ where: { siteId, role: "OWNER" } });
}

export async function PATCH(
  req: Request,
  { params }: { params: { siteId: string; membershipId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "OWNER");

    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });

    const membership = await prisma.membership.findFirst({
      where: { id: params.membershipId, siteId: params.siteId },
    });
    if (!membership) return NextResponse.json({ error: "Lid niet gevonden" }, { status: 404 });

    // Block demoting the final owner.
    if (membership.role === "OWNER" && parsed.data.role === "EDITOR" && (await ownerCount(params.siteId)) <= 1) {
      return NextResponse.json({ error: "Een site moet minstens één eigenaar houden" }, { status: 400 });
    }

    const updated = await prisma.membership.update({
      where: { id: membership.id },
      data: { role: parsed.data.role },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    return NextResponse.json({ ok: true, member: updated });
  } catch (e) {
    return handle(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { siteId: string; membershipId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "OWNER");

    const membership = await prisma.membership.findFirst({
      where: { id: params.membershipId, siteId: params.siteId },
    });
    if (!membership) return NextResponse.json({ error: "Lid niet gevonden" }, { status: 404 });

    if (membership.role === "OWNER" && (await ownerCount(params.siteId)) <= 1) {
      return NextResponse.json({ error: "De laatste eigenaar kan niet verwijderd worden" }, { status: 400 });
    }

    await prisma.membership.delete({ where: { id: membership.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

function handle(e: unknown) {
  if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  throw e;
}
