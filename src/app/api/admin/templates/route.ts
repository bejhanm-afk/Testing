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

const structureSchema = z.object({ pages: z.array(pageSchema).default([]) });

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(400).optional(),
  category: z.string().max(60).optional(),
  isPublished: z.boolean().optional(),
  structure: structureSchema,
});

export async function GET() {
  try {
    await requireSuperAdmin();
    const templates = await prisma.template.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ templates });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer", issues: parsed.error.flatten() }, { status: 400 });
    }
    const template = await prisma.template.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        category: parsed.data.category ?? null,
        isPublished: parsed.data.isPublished ?? true,
        structure: parsed.data.structure as unknown as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json({ ok: true, template }, { status: 201 });
  } catch (e) {
    return handle(e);
  }
}

function handle(e: unknown) {
  if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  throw e;
}
