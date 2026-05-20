import * as cheerio from "cheerio";

const LETTERBOXD_ORIGIN = "https://letterboxd.com";

/**
 * Shared movie entry extracted from Letterboxd HTML.
 * We ONLY trust:
 * - title
 * - year
 * - slug
 * - Letterboxd URL
 *
 * Posters/ratings come later from TMDB + OMDb.
 */
export type LetterboxdScrapeEntry = {
  slug: string;
  title: string;
  year?: number;
  letterboxdUrl: string;
};

export type ScrapeLetterboxdResult =
  | {
      ok: true;
      entries: LetterboxdScrapeEntry[];
      source:
        | "watchlist"
        | "list";
      meta?: {
        totalPages: number;
        truncated: boolean;
      };
    }
  | {
      ok: false;
      code:
        | "not_found"
        | "private"
        | "empty"
        | "blocked"
        | "rate_limited"
        | "parse_error"
        | "network";

      message: string;
    };

const FETCH_HEADERS: HeadersInit = {
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
};

const PAGE_DELAY_MS = 450;

/**
 * HARD SAFETY LIMIT
 *
 * Some Letterboxd lists contain:
 * - thousands
 * - tens of thousands
 * of movies.
 *
 * We NEVER want to fully scrape gigantic lists.
 */
const MAX_PAGES = 120;

/**
 * For gigantic lists:
 * we scrape all pages
 * BUT only keep a randomized subset.
 */
const MAX_MOVIES = 250;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(username);
}

function normalizeInput(input: string): string {
  return input.trim();
}

type ScrapeTarget =
  | { source: "watchlist"; username: string }
  | { source: "list"; baseUrl: string };

type ParsedInput =
  | { ok: true; target: ScrapeTarget }
  | { ok: false; result: ScrapeLetterboxdResult & { ok: false } };

function isBoxdShortLink(input: string): boolean {
  return /^(?:https?:\/\/)?boxd\.it\//i.test(input);
}

function isLetterboxdUrl(input: string): boolean {
  return /(?:https?:\/\/)?(?:www\.)?letterboxd\.com\//i.test(input);
}

function normalizeLetterboxdUrl(input: string): string {
  const trimmed = input.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "") + "/";
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${LETTERBOXD_ORIGIN}${path}`.replace(/\/+$/, "") + "/";
}

function extractWatchlistUsername(url: string): string | null {
  const m = url.match(
    /letterboxd\.com\/([a-zA-Z0-9_-]{1,64})\/watchlist(?:\/|$)/i,
  );
  return m?.[1] ?? null;
}

function extractListBaseUrl(url: string): string | null {
  const m = url.match(
    /^(https?:\/\/(?:www\.)?letterboxd\.com\/[a-zA-Z0-9_-]{1,64}\/list\/[a-zA-Z0-9_-]+)\/?(?:page\/\d+\/)?/i,
  );

  if (!m?.[1]) return null;

  return `${m[1].replace(/\/+$/, "")}/`;
}

async function resolveShortLink(
  url: string,
): Promise<{ ok: true; url: string } | { ok: false; result: ScrapeLetterboxdResult & { ok: false } }> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: FETCH_HEADERS,
      cache: "no-store",
      redirect: "follow",
    });

    if (res.status === 404) {
      return {
        ok: false,
        result: {
          ok: false,
          code: "not_found",
          message: "That shortened Letterboxd link was not found.",
        },
      };
    }

    if (res.status === 429) {
      return {
        ok: false,
        result: {
          ok: false,
          code: "rate_limited",
          message: "Letterboxd rate-limited this request. Try again later.",
        },
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        result: {
          ok: false,
          code: "network",
          message: "Could not resolve the shortened Letterboxd link.",
        },
      };
    }

    return { ok: true, url: res.url };
  } catch {
    return {
      ok: false,
      result: {
        ok: false,
        code: "network",
        message: "Could not resolve the shortened Letterboxd link.",
      },
    };
  }
}

async function parseInput(raw: string): Promise<ParsedInput> {
  let input = normalizeInput(raw);

  if (!input) {
    return {
      ok: false,
      result: {
        ok: false,
        code: "parse_error",
        message: "A Letterboxd username, watchlist URL, or list URL is required.",
      },
    };
  }

  if (isBoxdShortLink(input)) {
    const shortUrl = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const resolved = await resolveShortLink(shortUrl);
    if (!resolved.ok) {
      return { ok: false, result: resolved.result };
    }
    input = resolved.url;
  }

  if (input.includes("/watchlist/") || (isLetterboxdUrl(input) && input.includes("/watchlist"))) {
    const url = normalizeLetterboxdUrl(input);
    const username = extractWatchlistUsername(url);

    if (!username || !isValidUsername(username)) {
      return {
        ok: false,
        result: {
          ok: false,
          code: "parse_error",
          message: "Invalid Letterboxd watchlist URL.",
        },
      };
    }

    return { ok: true, target: { source: "watchlist", username } };
  }

  if (input.includes("/list/")) {
    const url = normalizeLetterboxdUrl(input);
    const baseUrl = extractListBaseUrl(url);

    if (!baseUrl) {
      return {
        ok: false,
        result: {
          ok: false,
          code: "parse_error",
          message: "Invalid Letterboxd list URL.",
        },
      };
    }

    return { ok: true, target: { source: "list", baseUrl } };
  }

  if (isLetterboxdUrl(input)) {
    return {
      ok: false,
      result: {
        ok: false,
        code: "parse_error",
        message: "Unsupported Letterboxd URL. Use a watchlist or list link.",
      },
    };
  }

  if (!isValidUsername(input)) {
    return {
      ok: false,
      result: {
        ok: false,
        code: "parse_error",
        message: "Invalid Letterboxd username.",
      },
    };
  }

  return { ok: true, target: { source: "watchlist", username: input } };
}

function splitTitleYear(fullDisplay: string): {
  title: string;
  year?: number;
} {
  const trimmed = fullDisplay.trim();

  const m = trimmed.match(/\((\d{4})\)\s*$/);

  if (!m || m.index === undefined) {
    return { title: trimmed };
  }

  const title = trimmed.slice(0, m.index).trim();

  const y = Number.parseInt(m[1], 10);

  return {
    title,
    year: Number.isFinite(y) ? y : undefined,
  };
}

function absoluteFilmUrl(
  link: string | undefined,
  slug: string,
): string {
  if (link?.trim()) {
    const path = link.startsWith("/")
      ? link
      : `/${link}`;

    return `${LETTERBOXD_ORIGIN}${path}`;
  }

  return `${LETTERBOXD_ORIGIN}/film/${slug}/`;
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

function parseEntriesFromHtml(
  html: string,
): LetterboxdScrapeEntry[] {
  const $ = cheerio.load(html);

  const out: LetterboxdScrapeEntry[] = [];

  $('div[data-component-class="LazyPoster"]').each((_, el) => {
    const node = $(el);

    const slug = node
      .attr("data-item-slug")
      ?.trim();

    if (!slug) return;

    const full =
      node
        .attr("data-item-full-display-name")
        ?.trim() ||
      node.attr("data-item-name")?.trim() ||
      "";

    if (!full) return;

    const { title, year } =
      splitTitleYear(full);

    if (!title) return;

    const link =
      node.attr("data-item-link") ??
      node.attr("data-target-link");

    const letterboxdUrl =
      absoluteFilmUrl(link, slug);

    out.push({
      slug,
      title,
      year,
      letterboxdUrl,
    });
  });

  return out;
}

function mergeEntries(
  rows: LetterboxdScrapeEntry[],
): LetterboxdScrapeEntry[] {
  const bySlug = new Map<
    string,
    LetterboxdScrapeEntry
  >();

  for (const row of rows) {
    bySlug.set(row.slug, row);
  }

  return [...bySlug.values()];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(
      Math.random() * (i + 1),
    );

    [copy[i], copy[j]] = [
      copy[j],
      copy[i],
    ];
  }

  return copy;
}

/**
 * WATCHLIST URLS
 */
function watchlistPageUrl(
  username: string,
  page: number,
): string {
  const u = encodeURIComponent(username);

  if (page <= 1) {
    return `${LETTERBOXD_ORIGIN}/${u}/watchlist/`;
  }

  return `${LETTERBOXD_ORIGIN}/${u}/watchlist/page/${page}/`;
}

/**
 * LIST URLS
 *
 * Example:
 * /user/list/cyberpunk-films/
 * /user/list/cyberpunk-films/page/2/
 */
function listPageUrl(
  baseUrl: string,
  page: number,
): string {
  const clean = baseUrl.endsWith("/")
    ? baseUrl
    : `${baseUrl}/`;

  if (page <= 1) return clean;

  return `${clean}page/${page}/`;
}

async function fetchHtml(
  url: string,
): Promise<Response> {
  return fetch(url, {
    method: "GET",
    headers: FETCH_HEADERS,
    cache: "no-store",
    redirect: "follow",
  });
}

function extractPaginationPages(
  html: string,
): number {
  const $ = cheerio.load(html);

  let max = 1;

  $(".pagination a[href]").each((_, el) => {
    const href =
      $(el).attr("href") ?? "";

    const m = href.match(
      /\/page\/(\d+)\//i,
    );

    if (m) {
      max = Math.max(
        max,
        Number.parseInt(m[1], 10),
      );
    }
  });

  return Math.max(1, max);
}

/**
 * MAIN SCRAPER
 *
 * Supports:
 * - usernames
 * - watchlist URLs
 * - curated list URLs
 * - boxd.it short links
 */
export async function scrapeLetterboxd(
  rawInput: string,
): Promise<ScrapeLetterboxdResult> {
  const parsed = await parseInput(rawInput);

  if (!parsed.ok) {
    return parsed.result;
  }

  const { target } = parsed;
  const type = target.source;

  const firstUrl =
    type === "watchlist"
      ? watchlistPageUrl(target.username, 1)
      : listPageUrl(target.baseUrl, 1);

  let firstRes: Response;

  try {
    firstRes =
      await fetchHtml(firstUrl);
  } catch {
    return {
      ok: false,
      code: "network",
      message:
        "Could not reach Letterboxd.",
    };
  }

  if (firstRes.status === 404) {
    return {
      ok: false,
      code: "not_found",
      message:
        type === "watchlist"
          ? "That Letterboxd member was not found."
          : "That Letterboxd list was not found.",
    };
  }

  if (firstRes.status === 429) {
    return {
      ok: false,
      code: "rate_limited",
      message:
        "Letterboxd rate-limited this request. Try again later.",
    };
  }

  if (!firstRes.ok) {
    return {
      ok: false,
      code: "blocked",
      message: `Letterboxd returned ${firstRes.status}.`,
    };
  }

  const firstHtml =
    await firstRes.text();

  if (
    detectBlockOrChallenge(
      firstHtml,
    )
  ) {
    return {
      ok: false,
      code: "blocked",
      message:
        "Letterboxd blocked automated access.",
    };
  }

  if (
    detectPrivateOrHidden(
      firstHtml,
    )
  ) {
    return {
      ok: false,
      code: "private",
      message:
        "This content is private.",
    };
  }

  const firstRows =
    parseEntriesFromHtml(firstHtml);

  const totalPages =
    Math.min(
      extractPaginationPages(
        firstHtml,
      ),
      MAX_PAGES,
    );

  const allRows: LetterboxdScrapeEntry[] =
    [...firstRows];

  for (
    let page = 2;
    page <= totalPages;
    page++
  ) {
    await sleep(PAGE_DELAY_MS);

    const url =
      type === "watchlist"
        ? watchlistPageUrl(target.username, page)
        : listPageUrl(target.baseUrl, page);

    let res: Response;

    try {
      res = await fetchHtml(url);
    } catch {
      break;
    }

    if (res.status === 429) break;

    if (!res.ok) break;

    const html = await res.text();

    if (
      detectBlockOrChallenge(
        html,
      )
    ) {
      break;
    }

    const rows =
      parseEntriesFromHtml(html);

    if (rows.length === 0) {
      break;
    }

    allRows.push(...rows);
  }

  let entries =
    mergeEntries(allRows);

  const originalLength =
    entries.length;

  /**
   * MASSIVE LIST PROTECTION
   */
  let truncated = false;

  if (
    entries.length > MAX_MOVIES
  ) {
    truncated = true;

    entries = shuffle(entries).slice(
      0,
      MAX_MOVIES,
    );
  }

  if (entries.length === 0) {
    return {
      ok: false,
      code: "empty",
      message:
        type === "watchlist"
          ? "No films found in this watchlist."
          : "No films found in this list.",
    };
  }

  console.log(
    `[scraper] ${type}: ${entries.length}/${originalLength} movies`,
  );

  return {
    ok: true,
    source: type,
    entries,
    meta: {
      totalPages,
      truncated,
    },
  };
}