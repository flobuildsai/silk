/**
 * Minimal HTML scraper for the /redesign flow. Pulls just enough signal
 * from a live page — title, meta description, og/twitter, headings, a few
 * paragraphs, primary brand token — to brief the generator.
 *
 * Intentionally tiny: no cheerio, no JSDOM. Regex extraction over the
 * fetched body, capped at ~300KB. We never render or execute the source.
 */

export type ScrapeResult = {
  url: string;
  finalUrl: string;
  ok: true;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  h1s: string[];
  h2s: string[];
  paragraphs: string[];
  brand?: string;
  bytes: number;
};

export type ScrapeError = {
  url: string;
  ok: false;
  error: string;
};

const MAX_BYTES = 300_000;
const FETCH_TIMEOUT_MS = 10_000;

const decodeEntities = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)));

const stripTags = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

function meta(html: string, name: string): string | undefined {
  const reName = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const reContent = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`,
    "i"
  );
  const m = html.match(reName) || html.match(reContent);
  return m ? decodeEntities(m[1]).trim() : undefined;
}

function collect(html: string, tag: string, limit: number): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) && out.length < limit) {
    const text = decodeEntities(stripTags(match[1]));
    if (text && text.length >= 2 && text.length <= 300) out.push(text);
  }
  return out;
}

export async function scrapeUrl(raw: string): Promise<ScrapeResult | ScrapeError> {
  let url = raw.trim();
  if (!url) return { url: raw, ok: false, error: "empty URL" };
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { url: raw, ok: false, error: "invalid URL" };
  }

  // Block private/internal addresses to prevent SSRF.
  const host = parsed.hostname;
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(host) ||
    host.startsWith("[::1]")
  ) {
    return { url, ok: false, error: "private hosts are not allowed" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(parsed.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; Silk/1.0; +https://silk.app/bot)",
        accept: "text/html,application/xhtml+xml",
      },
    });
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : "fetch failed";
    return { url, ok: false, error: `fetch failed: ${msg}` };
  }
  clearTimeout(timer);

  if (!res.ok) {
    return { url, ok: false, error: `upstream ${res.status}` };
  }
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
    return { url, ok: false, error: `not HTML (${ct || "unknown"})` };
  }

  // Cap body size.
  const reader = res.body?.getReader();
  if (!reader) return { url, ok: false, error: "empty body" };
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let html = "";
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BYTES) {
      html += decoder.decode(value, { stream: true });
      break;
    }
    html += decoder.decode(value, { stream: true });
  }
  try {
    reader.cancel().catch(() => {});
  } catch {}

  // Skip non-visible sections up front.
  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(stripTags(titleMatch[1])) : undefined;

  const description = meta(html, "description");
  const ogTitle = meta(html, "og:title");
  const ogDescription = meta(html, "og:description");
  const twitterTitle = meta(html, "twitter:title");
  const twitterDescription = meta(html, "twitter:description");
  const ogSiteName = meta(html, "og:site_name");
  const applicationName = meta(html, "application-name");

  const h1s = collect(html, "h1", 3);
  const h2s = collect(html, "h2", 6);
  const paragraphs = collect(html, "p", 8);

  // Brand guess: og:site_name > application-name > first token of title.
  let brand: string | undefined = ogSiteName || applicationName;
  if (!brand && title) {
    brand = title.split(/[—–|•:·-]/)[0].trim();
    if (brand.length > 48) brand = undefined;
  }

  return {
    url,
    finalUrl: res.url || parsed.toString(),
    ok: true,
    title,
    description,
    ogTitle,
    ogDescription,
    twitterTitle,
    twitterDescription,
    h1s,
    h2s,
    paragraphs,
    brand,
    bytes,
  };
}

/**
 * Turn a successful scrape into a Silk brief. The model gets signal
 * (real brand, real headings, real sub-copy) and a clear directive:
 * redesign, don't regurgitate.
 */
export function briefFromScrape(s: ScrapeResult): string {
  const parts: string[] = [];
  parts.push(
    `Redesign the following website as a Silk PageSpec. Preserve the meaning and factual content, but replace any marketing-slop copy with quiet, specific language. Pick the archetype that best fits what the site is actually about.`
  );
  parts.push("");
  parts.push(`Source URL: ${s.finalUrl || s.url}`);
  if (s.brand) parts.push(`Brand: ${s.brand}`);
  if (s.title) parts.push(`Page title: ${s.title}`);
  const desc = s.description || s.ogDescription || s.twitterDescription;
  if (desc) parts.push(`Meta description: ${desc}`);
  if (s.h1s.length) parts.push(`Original H1s: ${s.h1s.slice(0, 2).map((h) => `"${h}"`).join(", ")}`);
  if (s.h2s.length)
    parts.push(
      `Original H2s: ${s.h2s
        .slice(0, 4)
        .map((h) => `"${h}"`)
        .join(", ")}`
    );
  if (s.paragraphs.length) {
    parts.push(`Representative body copy:`);
    s.paragraphs.slice(0, 4).forEach((p) => parts.push(`  - ${p}`));
  }
  parts.push("");
  parts.push(
    `Keep the brand name verbatim if it exists. Write new headlines and sub-copy that say the same thing as the source but in the Silk voice — specific, quiet, no clichés. Pick exactly one archetype (minimalist-ui, editorial-luxury, or industrial-brutalist) that suits the source's category, and commit.`
  );
  return parts.join("\n");
}
