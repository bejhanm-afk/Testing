import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSuperAdmin, AuthError } from "@/lib/authz";

const schema = z.object({ globalRole: z.enum(["USER", "SUPER_ADMIN"]) });

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = await requireSuperAdmin();
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });

    // Don't allow an admin to strip their own platform access.
    if (params.userId === admin.id && parsed.data.globalRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Je kunt je eigen beheerdersrol niet intrekken" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.userId },
      data: { globalRole: parsed.data.globalRole },
      select: { id: true, email: true, globalRole: true },
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
