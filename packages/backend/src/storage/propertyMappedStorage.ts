// src/storage/propertyMappedStorage.ts

import type { Storage } from "../core/storage.js";

export type PropertyMapping = Record<string, string>;
// { "emailAddress": "email", "telephone": "phone", ... }

export class PropertyMappedStorage<T extends object> implements Storage<T> {
  constructor(
    private inner: Storage<Record<string, unknown>>,
    private mapping: PropertyMapping,
  ) {}

  async save(items: T[]): Promise<void> {
    const mapped = items.map((item) => this.mapItem(item));
    await this.inner.save(mapped);
  }

  private mapItem(item: T): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(item)) {
      // Nếu có mapping thì đổi tên, không thì giữ nguyên
      const mappedKey = this.mapping[key] ?? key;
      result[mappedKey] = value;
    }

    return result;
  }
}
