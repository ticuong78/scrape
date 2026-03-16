export interface PageParser<T> {
  parseItems(html: string, url: string): T[];
}