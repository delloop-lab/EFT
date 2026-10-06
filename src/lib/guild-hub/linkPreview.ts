export type LinkPreview = {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
};

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

export function extractFirstHttpUrl(text: string): string | null {
  const match = text.match(URL_RE);
  if (!match?.[0]) return null;
  return match[0].replace(/[.,;:!?]+$/g, "");
}

/** Remove a specific URL (or the first link) so members can write about the story. */
export function stripUrlFromText(text: string, url?: string | null): string {
  const target = url ?? extractFirstHttpUrl(text);
  if (!target) return text.trim();
  return text
    .split(target)
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as LinkPreview;
  if (!data?.url) return null;
  return data;
}
