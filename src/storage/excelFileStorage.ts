import { promises as fs } from "fs";
import * as XLSX from "xlsx";
import type { Storage } from "../core/storage.js";
import path from "path";

export class ExcelFileStorage<T extends object>
  implements Storage<T>
{
  constructor(private filePath: string) {}

  async save(items: T[]): Promise<void> {
    let existing: T[] = [];

    try {
    const raw = await fs.readFile(this.filePath);
      const workbook = XLSX.read(raw, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];

      if (sheetName) {
        const worksheet = workbook.Sheets[sheetName];
        if (worksheet) {
          existing = XLSX.utils.sheet_to_json<T>(worksheet);
        }
      }
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") {
        throw error;
      }
    }

    const baseDir = path.dirname(this.filePath);
    await fs.mkdir(baseDir, { recursive: true });

    const merged = [...existing, ...items];

    const worksheet = XLSX.utils.json_to_sheet(merged);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    await fs.writeFile(this.filePath, buffer);
  }
}