export interface PaginationStrategy {
  getNextPage(input: {
    html: string;
    currentUrl: string;
    currentPage: number;
  }): string | null;
}
