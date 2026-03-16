export type ScrapedItem = {
  id: String;
};

export type FetchResult = {
  url: string;
  status: number;
  body: string;
};

export interface Fetcher {
  fetch(url: string): Promise<FetchResult>;
}

export interface PageParser<T> {
  parseItems(html: string, url: string): T[];
}

export interface PaginationStrategy {
  getNextPage(input: {
    html: string;
    currentUrl: string;
    currentPage: number;
  }): string | null;
}

export interface Storage<T> {
  save(items: T[]): Promise<void>;
  hasSeen?(key: string): Promise<boolean>;
}
