import { PaginationCrawler } from "./crawler/paginationCrawler.js";
import { AxiosFetcher } from "./fetcher/axiosFetcher.js";
import { NextLinkPagination } from "./pagination/nextLinkPagination.js";
import { QueryPagePagination } from "./pagination/queryPagePagination.js";
import {
  CompanyParser,
  type CompanyScrapedItem,
} from "./parser/companyParser.js";
import { ExcelFileStorage } from "./storage/excelFileStorage.js";
import { JsonFileStorage } from "./storage/jsonFileStorage.js";
import { extractMaxPageFromPagination } from "./utils.js";

export async function scrapeAllProducts() {
  const startUrl =
    "https://trangvangvietnam.com/categories/484645/logistics-dich-vu-logistics.html";

  console.log("[SCRAPER] Starting scrape");
  console.log("[SCRAPER] URL:", startUrl);
  console.log("[SCRAPER] Max pages:", 100);

  const crawler = new PaginationCrawler<CompanyScrapedItem>(
    new AxiosFetcher(),
    new CompanyParser(),
    new QueryPagePagination("page"),
    new ExcelFileStorage<CompanyScrapedItem>("./output/products.xlsx"),
  );

  await crawler.run(
    {
      startUrl,
      maxPages: 100,
      delayMs: 1000,
    },
    extractMaxPageFromPagination,
  );

  console.log("[SCRAPER] Finished scrape");
}
await scrapeAllProducts();
