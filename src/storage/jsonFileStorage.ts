import { promises as fs } from "fs";
import type { Storage } from "../core/storage.js";
import path from "path";

export class JsonFileStorage<T> implements Storage<T> {
  constructor(private filePath: string) {}

  async save(items: T[]): Promise<void> {
    let existing: T[] = [];
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      existing = JSON.parse(raw);
    } catch {
      existing = [];
    }

    const baseDir = path.dirname(this.filePath);

    await fs.mkdir(baseDir, { recursive: true });

    const merged = [...existing, ...items];
    await fs.writeFile(this.filePath, JSON.stringify(merged, null, 2), "utf8", );
  }
}
