export interface Storage<T> {
  save(items: T[]): Promise<void>;
  hasSeen?(key: string): Promise<boolean>;
}
