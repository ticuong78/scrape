import type { PaginationStrategy } from "../core/types.js";

export class QueryPagePagination implements PaginationStrategy {
  constructor(
    private pageParam: string,
    private stopWhenNoItems: boolean = true,
    private extractCount?: (html: string) => number,
  ) {}

  getNextPage(input: {
    html: string;
    currentUrl: string;
    currentPage: number;
  }): string | null {
    if (this.stopWhenNoItems && this.extractCount) {
      const count = this.extractCount(input.html);
      if (count === 0) return null;
    }

    const url = new URL(input.currentUrl);
    url.searchParams.set(this.pageParam, String(input.currentPage + 1));
    return url.toString();
  }
}
