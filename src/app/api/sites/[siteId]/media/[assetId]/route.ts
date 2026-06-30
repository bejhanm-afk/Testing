import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertSiteAccess, AuthError } from "@/lib/authz";
import { getStorage } from "@/lib/storage";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: { siteId: string; assetId: string } }
) {
  try {
    await assertSiteAccess(params.siteId, "EDITOR");

    const asset = await prisma.mediaAsset.findFirst({
      where: { id: params.assetId, siteId: params.siteId },
    });
    if (!asset) return NextResponse.json({ error: "Media niet gevonden" }, { status: 404 });

    // Remove the stored file first; ignore storage errors so a missing file
    // never blocks cleaning up the database record.
    await getStorage()
      .del(asset.key)
      .catch(() => {});
    await prisma.mediaAsset.delete({ where: { id: asset.id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
