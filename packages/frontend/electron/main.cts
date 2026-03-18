import path from "path";
import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import * as fs from "node:fs";
import {
  AxiosFetcher,
  CompanyParser,
  CompanyScrapedItem,
  CrawlOptions,
  PaginationCrawler,
  QueryPagePagination,
  extractMaxPageFromPagination,
  Storage,
  isValidUrl,
  ExcelFileStorage,
  JsonFileStorage,
  Logger,
  LogContext,
  LogLevel,
  APICallStorage,
  PropertyMappedStorage,
} from "@scrape/backend";
import { resolve } from "node:path";

let mainWindow: BrowserWindow;

// --- HELPERS ---

class OnProgressLogger implements Logger {
  log(level: LogLevel, message: string, context: LogContext = {}): void {
    const parts = [
      `[${level.toUpperCase()}]`,
      context.runId ? `[run:${context.runId}]` : "",
      context.entity ? `[entity:${context.entity}]` : "",
      context.stage ? `[stage:${context.stage}]` : "",
      context.page !== undefined ? `[page:${context.page}]` : "",
      context.url ? `[url:${context.url}]` : "",
      message,
    ].filter(Boolean);

    if (!mainWindow.webContents.isLoading() && level === "info") {
      console.log("==============");
      console.log(context.page);
      console.log(context.maxPages);
      console.log(Math.round((context.page! / context.maxPages!) * 100));
      mainWindow.webContents.send("scrape-progress", {
        message: parts.join(" "),
        percent: Math.round((context.page! / context.maxPages!) * 100),
      });
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context);
  }
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Hàm trích xuất path từ kết quả dialog (để tái sử dụng)
function getPathFromDialog(
  result: Electron.OpenDialogReturnValue,
): string | null {
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
}

// --- SCRAPE LOGIC ---

export async function startScrape(
  url: string,
  storage: Storage<CompanyScrapedItem>,
  options: CrawlOptions,
): Promise<CompanyScrapedItem[]> {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const crawler = new PaginationCrawler(
    new AxiosFetcher(),
    new CompanyParser(),
    new QueryPagePagination("page"),
    storage,
    new OnProgressLogger(),
  );

  const allItems = await crawler.run(
    {
      ...options,
      startUrl: url,
    },
    extractMaxPageFromPagination,
  );

  return allItems;
}

// --- ELECTRON MAIN ---

const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- IPC HANDLERS ---

ipcMain.on("window-minimize", () => mainWindow.minimize());
ipcMain.on("window-maximize", () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on("window-close", () => mainWindow.close());

ipcMain.handle("select-folder", async () => {
  return await dialog.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath: app.getPath("downloads"), // Tự động lấy path download của máy bất kỳ
  });
});

ipcMain.handle(
  "start-scrape",
  async (
    event,
    url: string,
    storage: string,
    rawFolderResponse: any,
    options: CrawlOptions,
    propertyMapping: Record<string, string> = {},
  ) => {
    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      "_",
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
    ].join("");

    let storageObj: Storage<CompanyScrapedItem>;
    let fullPath: string | null = null;
    let fileName: string;

    if (storage === "api") {
      const apiUrl = rawFolderResponse as string;
      if (!apiUrl || !apiUrl.startsWith("http")) {
        throw new Error("Invalid API URL.");
      }

      fileName = `api_call_${timestamp}`;
      storageObj = new APICallStorage<CompanyScrapedItem>(apiUrl);
    } else {
      const folderPath =
        typeof rawFolderResponse === "string"
          ? rawFolderResponse
          : getPathFromDialog(rawFolderResponse);

      if (!folderPath) {
        throw new Error("No folder selected or invalid path.");
      }

      const ext = storage === "xlsx" ? "xlsx" : "json";
      fileName = `products_${timestamp}.${ext}`;
      fullPath = path.join(folderPath, fileName);

      if (storage === "xlsx") {
        storageObj = new ExcelFileStorage<CompanyScrapedItem>(fullPath);
      } else {
        storageObj = new JsonFileStorage<CompanyScrapedItem>(fullPath);
      }
    }

    const finalStorage: Storage<any> =
      Object.keys(propertyMapping).length > 0
        ? // @ts-ignore
          new PropertyMappedStorage(storageObj, propertyMapping)
        : storageObj;

    const allItems = await startScrape(url, finalStorage, options);

    let fileSizeInBytes = 0;
    let fileSizeFormatted = "0 B";

    if (fullPath && fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      fileSizeInBytes = stats.size;
      fileSizeFormatted = formatBytes(fileSizeInBytes);
    }

    return {
      path: fullPath ?? rawFolderResponse,
      size: fileSizeInBytes,
      fileName,
      sizeLabel: fileSizeFormatted,
      data: allItems,
    };
  },
);

ipcMain.on(
  "open-in-folder",
  (
    _e,
    file: {
      id: string;
      name: string;
      format: "json" | "xlsx" | "api";
      size: string;
      savedAt: Date;
      savedPath: string;
      data?: {
        id: string;
        name: string;
        category: string;
        address: string;
        location: string;
        state: string;
        telephone: string;
        hotline: string;
        emailAddress: string;
        website: string;
      }[];
    },
  ) => {
    shell.showItemInFolder(file.savedPath);
  },
);

ipcMain.handle("get-default-path", () => {
  const defaultPath = app.isPackaged
    ? resolve(app.getPath("documents"), "WebScraper", "output")
    : resolve(__dirname, "..", "..", "..", "output");

  if (!fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath, { recursive: true });
  }

  return defaultPath;
});

ipcMain.handle(
  "delete-in-folder",
  (
    _e,
    file: {
      id: string;
      name: string;
      format: "json" | "xlsx" | "api";
      size: string;
      savedAt: Date;
      savedPath: string;
      data?: {
        id: string;
        name: string;
        category: string;
        address: string;
        location: string;
        state: string;
        telephone: string;
        hotline: string;
        emailAddress: string;
        website: string;
      }[];
    },
  ) => {
    try {
      console.log(path.join(file.savedPath, file.name));

      if (!fs.existsSync(path.join(file.savedPath, file.name)))
        return {
          ok: true,
        };

      fs.rmSync(path.join(file.savedPath, file.name));

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error,
      };
    }
  },
);
