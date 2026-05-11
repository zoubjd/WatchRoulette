import * as cheerio from "cheerio";

const LETTERBOXD_ORIGIN = "https://letterboxd.com";

/** One row from the public watchlist HTML only (no posters/ratings from Letterboxd). */
export type WatchlistScrapeEntry = {
  slug: string;
  title: string;
  year?: number;
  letterboxdUrl: string;
};

export type ScrapeWatchlistResult =
  | { ok: true; entries: WatchlistScrapeEntry[] }
  | {
      ok: false;
      code: "not_found" | "private" | "empty" | "blocked" | "rate_limited" | "parse_error" | "network";
      message: string;
    };

const FETCH_HEADERS: HeadersInit = {
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
};

const PAGE_DELAY_MS = 450;
const MAX_PAGES = 80;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(username);
}

function watchlistPageUrl(username: string, page: number): string {
  const u = encodeURIComponent(username);
  if (page <= 1) return `${LETTERBOXD_ORIGIN}/${u}/watchlist/`;
  return `${LETTERBOXD_ORIGIN}/${u}/watchlist/page/${page}/`;
}

function splitTitleYear(fullDisplay: string): { title: string; year?: number } {
  const trimmed = fullDisplay.trim();
  const m = trimmed.match(/\((\d{4})\)\s*$/);
  if (!m || m.index === undefined) return { title: trimmed };
  const title = trimmed.slice(0, m.index).trim();
  const y = Number.parseInt(m[1], 10);
  return title ? { title, year: Number.isFinite(y) ? y : undefined } : { title: trimmed };
}

function absoluteFilmUrl(link: string | undefined, slug: string): string {
  if (link?.trim()) {
    const path = link.startsWith("/") ? link : `/${link}`;
    return `${LETTERBOXD_ORIGIN}${path}`;
  }
  return `${LETTERBOXD_ORIGIN}/film/${slug}/`;
}

function parseEntriesFromHtml(html: string): WatchlistScrapeEntry[] {
  const $ = cheerio.load(html);
  const out: WatchlistScrapeEntry[] = [];

  $('div[data-component-class="LazyPoster"]').each((_, el) => {
    const node = $(el);
    const slug = node.attr("data-item-slug")?.trim();
    if (!slug) return;

    const full =
      node.attr("data-item-full-display-name")?.trim() ||
      node.attr("data-item-name")?.trim() ||
      "";
    if (!full) return;

    const { title, year } = splitTitleYear(full);
    if (!title) return;

    const link = node.attr("data-item-link") ?? node.attr("data-target-link");
    const letterboxdUrl = absoluteFilmUrl(link, slug);

    out.push({ slug, title, year, letterboxdUrl });
  });

  return out;
}

function maxPaginationPage(html: string, username: string): number {
  const $ = cheerio.load(html);
  let max = 1;
  const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`/${escaped}/watchlist/page/(\\d+)/`, "i");

  $(".pagination a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const m = href.match(re);
    if (m) max = Math.max(max, Number.parseInt(m[1], 10));
  });

  return Math.max(1, max);
}

function detectBlockOrChallenge(html: string): boolean {
  const h = html.slice(0, 12000).toLowerCase();
  return (
    h.includes("cf-mitigated") ||
    h.includes("cf-browser-verification") ||
    h.includes("just a moment") ||
    h.includes("enable javascript and cookies") ||
    h.includes("checking your browser before accessing")
  );
}

function detectPrivateOrHidden(html: string): boolean {
  const lower = html.toLowerCase();
  return (
    lower.includes("watchlist is private") ||
    lower.includes("this watchlist is private") ||
    lower.includes("this list is private") ||
    lower.includes("member’s content is private") ||
    lower.includes("member's content is private") ||
    lower.includes("only approved followers can see")
  );
}

function mergeEntries(rows: WatchlistScrapeEntry[]): WatchlistScrapeEntry[] {
  const bySlug = new Map<string, WatchlistScrapeEntry>();
  for (const row of rows) {
    bySlug.set(row.slug, row);
  }
  return [...bySlug.values()];
}

async function fetchWatchlistHtml(username: string, page: number): Promise<Response> {
  const url = watchlistPageUrl(username, page);
  return fetch(url, {
    method: "GET",
    headers: FETCH_HEADERS,
    cache: "no-store",
    redirect: "follow",
  });
}

/**
 * Fetches and parses a public Letterboxd watchlist (paginated, watchlist URL only).
 */
export async function scrapeLetterboxdWatchlist(rawUsername: string): Promise<ScrapeWatchlistResult> {
  const username = rawUsername.trim();
  if (!username) {
    return { ok: false, code: "parse_error", message: "Username is required." };
  }
  if (!isValidUsername(username)) {
    return {
      ok: false,
      code: "parse_error",
      message: "Username may only contain letters, numbers, underscores, and hyphens.",
    };
  }

  let firstRes: Response;
  try {
    firstRes = await fetchWatchlistHtml(username, 1);
  } catch {
    return {
      ok: false,
      code: "network",
      message: "Could not reach Letterboxd. Check your connection and try again.",
    };
  }

  if (firstRes.status === 404) {
    return {
      ok: false,
      code: "not_found",
      message: "That Letterboxd member was not found.",
    };
  }

  if (firstRes.status === 429) {
    return {
      ok: false,
      code: "rate_limited",
      message: "Letterboxd rate-limited this request. Wait a minute and try again.",
    };
  }

  if (!firstRes.ok) {
    return {
      ok: false,
      code: "blocked",
      message: `Letterboxd returned an error (${firstRes.status}). Try again later.`,
    };
  }

  const firstHtml = await firstRes.text();

  if (detectBlockOrChallenge(firstHtml)) {
    return {
      ok: false,
      code: "blocked",
      message:
        "Letterboxd blocked automated access (often Cloudflare). Try again in a few minutes or from another network.",
    };
  }

  if (detectPrivateOrHidden(firstHtml)) {
    return {
      ok: false,
      code: "private",
      message: "This watchlist is private or hidden. Only public watchlists can be loaded.",
    };
  }

  const firstRows = parseEntriesFromHtml(firstHtml);
  const maxPage = maxPaginationPage(firstHtml, username);
  const cappedMax = Math.min(maxPage, MAX_PAGES);

  const allRows: WatchlistScrapeEntry[] = [...firstRows];

  for (let page = 2; page <= cappedMax; page++) {
    await sleep(PAGE_DELAY_MS);
    let res: Response;
    try {
      res = await fetchWatchlistHtml(username, page);
    } catch {
      break;
    }
    if (res.status === 429) break;
    if (!res.ok) break;
    const html = await res.text();
    if (detectBlockOrChallenge(html)) break;
    const rows = parseEntriesFromHtml(html);
    if (rows.length === 0) break;
    allRows.push(...rows);
  }

  const entries = mergeEntries(allRows);

  if (entries.length === 0) {
    return {
      ok: false,
      code: "empty",
      message: "No films found on this watchlist (it may be empty).",
    };
  }

  return { ok: true, entries };
}
