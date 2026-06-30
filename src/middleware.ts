import { NextRequest, NextResponse } from "next/server";
import { parseHost } from "@/lib/host";

/**
 * Host-based routing. Requests to a tenant subdomain or custom domain are
 * rewritten to the public renderer under /_sites/<host>/<path>, while the
 * platform app (app.<root> / root) is served normally.
 *
 * Auth-gating of /dashboard and /admin is done in the layouts/route handlers
 * (which can use the database), not here — middleware runs on the edge.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host");
  const info = parseHost(host);

  // Platform app: serve as-is.
  if (info.kind === "platform") return NextResponse.next();

  // Never rewrite Next internals / API / static.
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/uploads") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Tenant host -> rewrite into the public site renderer namespace.
  const tenantKey =
    info.kind === "subdomain" ? info.subdomain : `domain:${info.domain}`;
  const rewritten = new URL(
    `/site/${encodeURIComponent(tenantKey)}${url.pathname}`,
    req.url
  );
  return NextResponse.rewrite(rewritten);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
