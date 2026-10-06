import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type LinkPreview = {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
};

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "::1"
  ) {
    return true;
  }
  if (/^(127\.|10\.|192\.168\.|169\.254\.)/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}

function metaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      "i",
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtml(m[1].trim());
  }
  return undefined;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function pageTitle(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m?.[1] ? decodeHtml(m[1].trim()) : undefined;
}

function absoluteUrl(maybeRelative: string, base: string): string | undefined {
  try {
    return new URL(maybeRelative, base).href;
  } catch {
    return undefined;
  }
}

function scrapeHtml(html: string, pageUrl: string): LinkPreview {
  const target = new URL(pageUrl);
  const imageRaw =
    metaContent(html, "og:image") ||
    metaContent(html, "og:image:secure_url") ||
    metaContent(html, "og:image:url") ||
    metaContent(html, "twitter:image") ||
    metaContent(html, "twitter:image:src");
  const title =
    metaContent(html, "og:title") ||
    metaContent(html, "twitter:title") ||
    pageTitle(html);
  const description =
    metaContent(html, "og:description") ||
    metaContent(html, "twitter:description") ||
    metaContent(html, "description");
  const siteName =
    metaContent(html, "og:site_name") || target.hostname.replace(/^www\./, "");

  return {
    url: pageUrl,
    title,
    description: description?.slice(0, 280),
    imageUrl: imageRaw ? absoluteUrl(imageRaw, pageUrl) : undefined,
    siteName,
  };
}

async function scrapeDirect(target: URL): Promise<LinkPreview | null> {
  const res = await fetch(target.href, {
    redirect: "follow",
    signal: AbortSignal.timeout(9000),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-GB,en;q=0.9",
    },
  });
  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
    return {
      url: target.href,
      title: target.hostname,
      siteName: target.hostname.replace(/^www\./, ""),
    };
  }

  const html = (await res.text()).slice(0, 400_000);
  return scrapeHtml(html, target.href);
}

async function scrapeMicrolink(target: URL): Promise<LinkPreview | null> {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(target.href)}&palette=false&audio=false&video=false&iframe=false`;
  const res = await fetch(endpoint, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    status?: string;
    data?: {
      url?: string;
      title?: string;
      description?: string;
      publisher?: string;
      image?: { url?: string } | null;
    };
  };
  if (json.status !== "success" || !json.data) return null;
  const data = json.data;
  return {
    url: data.url || target.href,
    title: data.title || undefined,
    description: data.description?.slice(0, 280),
    imageUrl: data.image?.url || undefined,
    siteName: data.publisher || target.hostname.replace(/^www\./, ""),
  };
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url")?.trim();
  if (!raw) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol) || isBlockedHost(target.hostname)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
  }

  try {
    let preview = await scrapeDirect(target).catch(() => null);
    if (!preview?.imageUrl) {
      const fallback = await scrapeMicrolink(target).catch(() => null);
      if (fallback) {
        preview = {
          url: fallback.url,
          title: fallback.title || preview?.title,
          description: fallback.description || preview?.description,
          imageUrl: fallback.imageUrl || preview?.imageUrl,
          siteName: fallback.siteName || preview?.siteName,
        };
      }
    }

    if (!preview) {
      return NextResponse.json({ error: "Preview unavailable" }, { status: 502 });
    }

    return NextResponse.json(preview, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Preview unavailable" }, { status: 502 });
  }
}
