import type {
  Fetcher,
  PageParser,
  PaginationStrategy,
  Storage,
} from "../core/types.js";

export type CrawlOptions = {
  startUrl: string;
  maxPages?: number; // hard cap
  delayMs?: number;
};

export type DiscoverMaxPages = (args: {
  html: string;
  currentUrl: string;
}) => number | null;

export class PaginationCrawler<T> {
  constructor(
    private fetcher: Fetcher,
    private parser: PageParser<T>,
    private paginator: PaginationStrategy,
    private storage: Storage<T>,
  ) {}

  async run(
    options: CrawlOptions,
    discoverMaxPages?: DiscoverMaxPages,
  ): Promise<void> {
    const visited = new Set<string>();
    let currentUrl: string | null = options.startUrl;
    let currentPage = 1;
    const delayMs = options.delayMs ?? 1000;

    let effectiveMaxPages = options.maxPages ?? Number.MAX_SAFE_INTEGER;

    while (currentUrl && currentPage <= effectiveMaxPages) {
      if (visited.has(currentUrl)) break;
      visited.add(currentUrl);

      const res = await this.fetcher.fetch(currentUrl);
      if (res.status >= 400) {
        throw new Error(`Fetch failed: ${res.status} - ${currentUrl}`);
      }

      if (currentPage === 1 && discoverMaxPages) {
        const discovered = discoverMaxPages({
          html: res.body,
          currentUrl,
        });

        if (discovered !== null) {
          effectiveMaxPages = Math.min(effectiveMaxPages, discovered);
        }
      }

      const items = this.parser.parseItems(res.body, currentUrl);
      await this.storage.save(items);

      const nextUrl = this.paginator.getNextPage({
        html: res.body,
        currentUrl,
        currentPage,
      });

      currentUrl = nextUrl;
      currentPage++;

      if (currentUrl && currentPage <= effectiveMaxPages) {
        await sleep(delayMs);
      }
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
