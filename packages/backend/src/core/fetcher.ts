export interface Fetcher {
  fetch(url: string): Promise<FetchResult>;
}

export type FetchResult = {
  url: string;
  status: number;
  body: string;
};
