export {};

declare global {
  interface Window {
    electronAPI: {
      // Scraper
      onProgress: (callback: (data: any) => void) => void | Destructor;
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
        propertyMapping: Record<string, string> = {},
      ) => Promise<{
        path: string;
        size: number;
        fileName: string;
        sizeLabel: string;
        data: any;
      }>;
      getDefaultPath: () => Promise<string>;
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
      }) => void;

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
      }) => Promise<{
        ok: boolean;
        error?: string;
      }>;
    };
  }
}
