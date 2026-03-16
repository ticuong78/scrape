export {};

declare global {
  interface Window {
    electronAPI: {
      // Scraper
      startScrape: (url: string) => void;
      onProgress: (callback: (data: any) => void) => void;
      selectFolder: () => Promise<string>;

      // Window controls
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}