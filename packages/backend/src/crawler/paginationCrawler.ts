import type { Fetcher } from "../core/fetcher.js";
import type { Logger } from "../core/logging.js";
import type { PaginationStrategy } from "../core/pagination.js";
import type { PageParser } from "../core/parser.js";
import type { Storage } from "../core/storage.js";
import { ConsoleLogger } from "../logging/consoleLogger.js";

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
    private logger: Logger = new ConsoleLogger(),
  ) {}

  async run(
    options: CrawlOptions,
    discoverMaxPages?: DiscoverMaxPages,
  ): Promise<T[]> {
    const visited = new Set<string>();
    const allItems: T[] = [];
    let currentUrl: string | null = options.startUrl;
    let currentPage = 1;
    const delayMs = options.delayMs ?? 1000;

    let effectiveMaxPages = options.maxPages ?? Number.MAX_SAFE_INTEGER;
    let totalItems = 0;

    this.logger.info("Crawler started", {
      stage: "run",
      url: options.startUrl,
      page: 1,
    });

    while (currentUrl && currentPage <= effectiveMaxPages) {
      if (visited.has(currentUrl)) {
        this.logger.warn("URL already visited, stopping crawl", {
          stage: "run",
          url: currentUrl,
          page: currentPage,
        });
        break;
      }

      visited.add(currentUrl);

      this.logger.info("Fetching page", {
        stage: "fetch",
        url: currentUrl,
        page: currentPage,
      });

      const res = await this.fetcher.fetch(currentUrl);

      this.logger.debug(
        `Fetched response status=${res.status} bodyLength=${res.body.length}`,
        {
          stage: "fetch",
          url: currentUrl,
          page: currentPage,
        },
      );

      if (res.status >= 400) {
        this.logger.error(`Fetch failed with status=${res.status}`, {
          stage: "fetch",
          url: currentUrl,
          page: currentPage,
        });
        throw new Error(`Fetch failed: ${res.status} - ${currentUrl}`);
      }

      if (currentPage === 1 && discoverMaxPages) {
        const discovered = discoverMaxPages({
          html: res.body,
          currentUrl,
        });

        if (discovered !== null) {
          const previousMax = effectiveMaxPages;
          effectiveMaxPages = Math.min(effectiveMaxPages, discovered);

          this.logger.info(
            `Discovered max pages=${discovered}, effective max pages updated from ${previousMax} to ${effectiveMaxPages}`,
            {
              stage: "pagination",
              url: currentUrl,
              page: currentPage,
            },
          );
        } else {
          this.logger.warn("Could not discover max pages from first page", {
            stage: "pagination",
            url: currentUrl,
            page: currentPage,
          });
        }
      }

      this.logger.info("Parsing page", {
        stage: "parse",
        url: currentUrl,
        page: currentPage,
      });

      const items = this.parser.parseItems(res.body, currentUrl);
      totalItems += items.length;
      allItems.push(...items);

      this.logger.info(
        `Parsed items=${items.length}, totalItems=${totalItems}`,
        {
          stage: "parse",
          url: currentUrl,
          page: currentPage,
        },
      );

      this.logger.info(`Saving items=${items.length}`, {
        stage: "save",
        url: currentUrl,
        page: currentPage,
      });

      await this.storage.save(items);

      this.logger.info("Save completed", {
        stage: "save",
        url: currentUrl,
        page: currentPage,
      });

      const nextUrl = this.paginator.getNextPage({
        html: res.body,
        currentUrl,
        currentPage,
      });

      this.logger.debug(`Next URL=${nextUrl ?? "null"}`, {
        stage: "pagination",
        url: currentUrl,
        page: currentPage,
      });

      currentUrl = nextUrl;
      currentPage++;

      if (currentUrl && currentPage <= effectiveMaxPages) {
        this.logger.debug(`Sleeping for ${delayMs}ms`, {
          stage: "delay",
          url: currentUrl,
          page: currentPage,
        });

        await sleep(delayMs);
      }
    }

    this.logger.info(`Crawler finished, totalItems=${totalItems}`, {
      stage: "run",
      page: currentPage - 1,
    });

    return allItems;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
