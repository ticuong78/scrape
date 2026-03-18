import type { Storage } from "../core/storage.js";

export class APICallStorage<T extends object> implements Storage<T> {
  constructor(private apiUrl: string) {}

  async save(items: T[]): Promise<void> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText} - ${this.apiUrl}`,
      );
    }
  }
}
