import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Scraper
  startScrape: (url: string) => ipcRenderer.send("start-scrape", url),
  onProgress: (cb: (data: any) => void) =>
    ipcRenderer.on("scrape-progress", (_e, data) => cb(data)),
  selectFolder: () => ipcRenderer.invoke("select-folder"),

  // Window controls
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),
});