import axios from "axios";
import type { Fetcher, FetchResult } from "../core/fetcher.js";

export class AxiosFetcher implements Fetcher {
  async fetch(url: string): Promise<FetchResult> {
    const res = await axios.get<string>(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 15000,
    });

    return {
      url,
      status: res.status,
      body: res.data,
    };
  }
}
