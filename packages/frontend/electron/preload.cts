import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Scraper
  // @ts-ignore
  onProgress: (cb) => {
    // @ts-ignore
    const handler = (_e, data) => {
      console.log(data);
      cb(data);
    };
    ipcRenderer.on("scrape-progress", handler);
    return () => ipcRenderer.removeListener("scrape-progress", handler);
  },

  selectFolder: () =>
    ipcRenderer.invoke("select-folder").then((result) => {
      return result.filePaths[0];
    }),

  // Window controls
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),

  startScrape: (
    url: string,
    storage: string,
    filepath: string,
    options: {
      maxPages?: number;
      delayMs?: number;
    } = {
      maxPages: 100,
      delayMs: 1000,
    },
    propertyMapping: any,
  ) =>
    ipcRenderer
      .invoke("start-scrape", url, storage, filepath, options, propertyMapping)
      .then((result) => {
        return result;
      }),

  getDefaultPath: () => ipcRenderer.invoke("get-default-path"),
  handleOpenInFolder: (file: {
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
  }) => ipcRenderer.send("open-in-folder", file),
  handleDeleteFile: (file: {
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
  }) => ipcRenderer.invoke("delete-in-folder", file),
});
