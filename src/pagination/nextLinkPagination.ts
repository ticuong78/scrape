import * as cheerio from "cheerio";
import type { PaginationStrategy } from "../core/types.js";

export class NextLinkPagination implements PaginationStrategy {
  constructor(private selector: string) {}

  getNextPage(input: {
    html: string;
    currentUrl: string;
    currentPage: number;
  }): string | null {
    const $ = cheerio.load(input.html);
    const href = $(this.selector).attr("href");

    if (!href) return null;
    return new URL(href, input.currentUrl).toString();
  }
}
