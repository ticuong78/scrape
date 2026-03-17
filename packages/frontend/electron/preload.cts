import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Scraper
  onProgress: (cb: (data: any) => void) =>
    ipcRenderer.on("scrape-progress", (_e, data) => cb(data)),

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
  ) =>
    ipcRenderer
      .invoke("start-scrape", url, storage, filepath, options)
      .then((result) => {
        return result;
      }),

  getDefaultPath: () => ipcRenderer.invoke("get-default-path"),
});
