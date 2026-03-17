import * as cheerio from "cheerio";

export function extractMaxPageFromPagination(args: {
  html: string;
  currentUrl: string;
}): number | null {
  const $ = cheerio.load(args.html);

  const numbers = $("#paging a")
    .map((_, el) => {
      const text = $(el).text().trim();
      const n = Number(text);
      return Number.isInteger(n) ? n : null;
    })
    .get()
    .filter((v): v is number => v !== null);

  if (numbers.length === 0) return null;
  return Math.max(...numbers);
}

export function isValidUrl(url: string): {
  valid: boolean;
  message?: string;
} {
  if (!url.trim()) {
    return { valid: false, message: "URL không được để trống" };
  }

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, message: "Chỉ chấp nhận http:// hoặc https://" };
    }

    if (!parsed.hostname.includes(".")) {
      return { valid: false, message: "Hostname không hợp lệ" };
    }

    return { valid: true };
  } catch {
    return { valid: false, message: "URL không đúng định dạng" };
  }
}
