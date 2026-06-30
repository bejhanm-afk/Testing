import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSuperAdmin, AuthError } from "@/lib/authz";
import type { Prisma } from "@prisma/client";

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string(),
  content: z.array(z.any()).default([]),
});

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(400).optional(),
  category: z.string().max(60).optional(),
  isPublished: z.boolean().optional(),
  structure: z.object({ pages: z.array(pageSchema) }).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer", issues: parsed.error.flatten() }, { status: 400 });
    }

    const data: Prisma.TemplateUpdateInput = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.category !== undefined) data.category = parsed.data.category;
    if (parsed.data.isPublished !== undefined) data.isPublished = parsed.data.isPublished;
    if (parsed.data.structure !== undefined) data.structure = parsed.data.structure as unknown as Prisma.InputJsonValue;

    const template = await prisma.template.update({ where: { id: params.id }, data });
    return NextResponse.json({ ok: true, template });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin();
    // Sites referencing this template keep working; null out the FK first.
    await prisma.site.updateMany({ where: { templateId: params.id }, data: { templateId: null } });
    await prisma.template.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
