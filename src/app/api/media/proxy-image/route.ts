import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const EXTRA_ALLOWED = new Set([
  "lh3.googleusercontent.com",
  "storage.googleapis.com",
]);

function isAllowedImageUrl(url: URL): boolean {
  if (url.protocol !== "https:") return false;
  const h = url.hostname.toLowerCase();
  if (EXTRA_ALLOWED.has(h)) return true;
  if (h === "replicate.delivery" || h.endsWith(".replicate.delivery"))
    return true;
  return false;
}

/** Server-side fetch when the browser cannot read cross-origin pixels (CORS). */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    const raw = typeof body.url === "string" ? body.url.trim() : "";
    if (!raw) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
    let target: URL;
    try {
      target = new URL(raw);
    } catch {
      return NextResponse.json({ error: "invalid url" }, { status: 400 });
    }
    if (!isAllowedImageUrl(target)) {
      return NextResponse.json(
        { error: "host not allowed for proxy" },
        { status: 403 }
      );
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 45_000);
    const upstream = await fetch(target.toString(), {
      signal: ctrl.signal,
      headers: { Accept: "image/*,*/*" },
    }).finally(() => clearTimeout(t));

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `upstream ${upstream.status}` },
        { status: 502 }
      );
    }

    const buf = await upstream.arrayBuffer();
    if (buf.byteLength > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "image too large" }, { status: 413 });
    }

    const type =
      upstream.headers.get("content-type")?.split(";")[0]?.trim() ||
      "image/png";

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "proxy failed";
    console.error("[api/media/proxy-image]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
