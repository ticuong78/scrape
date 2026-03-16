import { PaginationCrawler } from "./crawler/paginationCrawler.js";
import { AxiosFetcher } from "./fetcher/axiosFetcher.js";
import { NextLinkPagination } from "./pagination/nextLinkPagination.js";
import { QueryPagePagination } from "./pagination/queryPagePagination.js";
import {
  CompanyParser,
  type CompanyScrapedItem,
} from "./parser/companyParser.js";
import { JsonFileStorage } from "./storage/jsonFileStorage.js";
import { extractMaxPageFromPagination } from "./utils.js";

export async function scrapeAllProducts() {
  const crawler = new PaginationCrawler<CompanyScrapedItem>(
    new AxiosFetcher(),
    new CompanyParser(),
    new QueryPagePagination("page"),
    new JsonFileStorage<CompanyScrapedItem>("products.json"),
  );

  await crawler.run(
    {
      startUrl:
        "https://trangvangvietnam.com/categories/484645/logistics-dich-vu-logistics.html",
      maxPages: 100, // hard cap an toàn
      delayMs: 1000,
    },
    extractMaxPageFromPagination,
  );
}

await scrapeAllProducts();
