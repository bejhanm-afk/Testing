import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serves locally stored uploads. `next start` does not serve files added to
 * /public after build, so uploads are written to LOCAL_UPLOAD_DIR (outside
 * /public) and streamed back here. Swap for a CDN/S3 public URL in production.
 */

const DIR = process.env.LOCAL_UPLOAD_DIR ?? "var/uploads";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  // Reject path traversal before touching the filesystem.
  const rel = params.path.join("/");
  if (rel.includes("..")) return new NextResponse("Bad request", { status: 400 });

  const abs = path.join(process.cwd(), DIR, rel);
  try {
    const data = await readFile(abs);
    const type = MIME[path.extname(abs).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
