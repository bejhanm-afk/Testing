import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { getStorage } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

export async function GET(
  _req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "EDITOR");
    const media = await prisma.mediaAsset.findMany({
      where: { siteId: params.siteId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ media });
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

    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Bestandstype niet toegestaan (alleen afbeeldingen)" }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Bestand te groot (max 5 MB)" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await getStorage().put(params.siteId, file.name, buffer, file.type);

    const asset = await prisma.mediaAsset.create({
      data: {
        siteId: params.siteId,
        url: stored.url,
        key: stored.key,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  } catch (e) {
    return handle(e);
  }
}

function handle(e: unknown) {
  if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  throw e;
}
