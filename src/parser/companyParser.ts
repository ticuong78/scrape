import * as cheerio from "cheerio";
import type { PageParser } from "../core/parser.js";
import type { ScrapedItem } from "../core/types.js";

export interface CompanyScrapedItem extends ScrapedItem {
  name: string;
  category?: string;
  address?: string;
  location?: string;
  state?: string;
  telephone?: string;
  hotline?: string;
  website?: string;
  emailAddress?: string;
  facebook?: string;
  notes?: string;
}

type ParsedAddress = {
  address: string | undefined;
  location: string | undefined;
  state: string | undefined;
};

type ParsedContact = {
  emailAddress: string | undefined;
  website: string | undefined;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePhone(raw?: string): string | undefined {
  const digits = raw?.replace(/\D+/g, "");
  return digits || undefined;
}

function safeUrl(href: string, baseUrl: string): string | undefined {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function cleanText(value?: string): string | undefined {
  const text = value?.replace(/\s+/g, " ").trim();
  return text || undefined;
}

function parseAddressBlock(small: cheerio.Cheerio<any>): ParsedAddress {
  const location = cleanText(small.find("span.fw500").first().text());
  const fullText = cleanText(small.text());

  if (!fullText)
    return {
      location: undefined,
      state: undefined,
      address: undefined,
    };

  if (location) {
    const pattern = new RegExp(
      `^(.+?),\\s*${escapeRegExp(location)}\\s*,\\s*(.+)$`,
      "i",
    );
    const match = fullText.match(pattern);

    if (match) {
      return {
        address: cleanText(match[1]),
        location,
        state: cleanText(match[2]),
      };
    }

    const parts = fullText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const locationIndex = parts.findIndex(
      (p) => p.toLowerCase() === location.toLowerCase(),
    );

    if (locationIndex !== -1) {
      return {
        address: cleanText(parts.slice(0, locationIndex).join(", ")),
        location,
        state: cleanText(parts.slice(locationIndex + 1).join(", ")),
      };
    }

    return {
      address: fullText,
      location,
      state: undefined,
    };
  }

  const lastComma = fullText.lastIndexOf(",");
  if (lastComma !== -1) {
    return {
      address: cleanText(fullText.slice(0, lastComma)),
      location: undefined,
      state: cleanText(fullText.slice(lastComma + 1)),
    };
  }

  return {
    location: undefined,
    address: fullText,
    state: undefined,
  };
}

function parseContactSection(card: cheerio.Cheerio<any>): ParsedContact {
  const section = card.find(".email_web_section").first();

  const emailLink = section.find('a[href^="mailto:"]').first();
  const webLink = section.find('a[href]:not([href^="mailto:"])').first();

  const emailAddress =
    cleanText(emailLink.attr("href")?.slice("mailto:".length)) ||
    cleanText(emailLink.attr("title")?.replace(/^.*?:\s*/, "")); // "Dia chi email: abc@..." → "abc@..."

  const website = cleanText(webLink.attr("href")) || cleanText(webLink.text());

  return { emailAddress, website };
}

function parseHotline(card: cheerio.Cheerio<any>): string | undefined {
  // Tìm thẳng tel link trong span.fw500 (cấu trúc thực tế trong HTML)
  const telInSpan = card
    .find("span.fw500 a[href^='tel:']")
    .first()
    .attr("href");

  if (telInSpan) return normalizePhone(telInSpan.slice("tel:".length));

  // Fallback: tìm div nào chứa text "Hotline" rồi lấy tel link trong đó
  let telHref: string | undefined;
  card.find("div, p").each((_, el) => {
    const $el = card.find(el as any);
    if ($el.text().toLowerCase().includes("hotline")) {
      const href = $el.find("a[href^='tel:']").first().attr("href");
      if (href) {
        telHref = href;
        return false; // break
      }
    }
  });

  return normalizePhone(telHref?.slice("tel:".length));
}

export class CompanyParser implements PageParser<CompanyScrapedItem> {
  parseItems(html: string, baseUrl: string): CompanyScrapedItem[] {
    const $ = cheerio.load(html);
    const items: CompanyScrapedItem[] = [];

    $(".div_list_cty > div").each((_, el) => {
      const card = $(el);

      const anchor = card.find("[class*='listings_center'] .text-capitalize a").first();
      const name = cleanText(anchor.text());
      if (!name) return;

      const id = card.find(".stt_txt").text().trim();

      const category = cleanText(
        card.find(".div_logo_diachi .nganh_listing_txt").first().text(),
      );

      const { address, location, state } = parseAddressBlock(
        card.find(".logo_congty_diachi small").first(),
      );

      const telephone = normalizePhone(
        card
          .find(".listing_dienthoai a[href^='tel:']")
          .first()
          .attr("href")
          ?.slice("tel:".length),
      );

      const { emailAddress, website } = parseContactSection(card);

      items.push({
        id,
        name,
        category,
        address,
        location,
        state,
        telephone,
        hotline: parseHotline(card),
        emailAddress,
        website,
      });
    });

    return items;
  }
}
