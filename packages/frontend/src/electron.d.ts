export {};

declare global {
  interface Window {
    electronAPI: {
      // Scraper
      onProgress: (callback: (data: any) => void) => void;
      selectFolder: () => Promise<string>;

      // Window controls
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;

      startScrape: (
        url: string,
        storage: string,
        filepath: string,
        options?: {
          maxPages?: number;
          delayMs?: number;
        },
      ) => Promise<{
        path: string;
        size: number;
        fileName: string;
        sizeLabel: string;
        data: any;
      }>;
      getDefaultPath: () => Promise<string>;
    };
  }
}
