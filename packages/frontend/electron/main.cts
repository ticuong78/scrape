import path from "path";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
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
} from "@scrape/backend";
import { resolve } from "node:path";

// --- HELPERS ---

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
  );

  const allItems = await crawler.run(
    {
      ...options,
      startUrl: url, // ✅ Merge url vào options
    },
    extractMaxPageFromPagination,
  );

  return allItems;
}

// --- ELECTRON MAIN ---

const isDev = process.env.NODE_ENV === "development";
let mainWindow: BrowserWindow;

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
  ) => {
    // 1. Xử lý lấy đường dẫn string từ tham số truyền vào
    const folderPath =
      typeof rawFolderResponse === "string"
        ? rawFolderResponse
        : getPathFromDialog(rawFolderResponse);

    if (!folderPath) {
      throw new Error("No folder selected or invalid path.");
    }

    // 2. Cấu hình Storage dựa trên extension
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

    const ext = storage === "xlsx" ? "xlsx" : "json";
    const fileName = `products_${timestamp}.${ext}`;
    const fullPath = path.join(folderPath, fileName);

    let storageObj: Storage<CompanyScrapedItem>;

    if (storage === "xlsx") {
      storageObj = new ExcelFileStorage<CompanyScrapedItem>(fullPath);
    } else {
      storageObj = new JsonFileStorage<CompanyScrapedItem>(fullPath);
    }

    // 3. Thực thi
    const allItems = await startScrape(url, storageObj, options);

    // 4. Lấy thông tin file sau khi scrape xong
    let fileSizeInBytes = 0;
    let fileSizeFormatted = "0 B";

    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      fileSizeInBytes = stats.size;
      fileSizeFormatted = formatBytes(fileSizeInBytes);
    }

    return {
      path: folderPath,
      size: fileSizeInBytes,
      fileName: fileName,
      sizeLabel: fileSizeFormatted,
      data: allItems,
    };
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
