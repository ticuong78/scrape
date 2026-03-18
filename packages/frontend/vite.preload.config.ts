import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "electron/preload.cts",
      formats: ["cjs"],
      fileName: () => "preload.cjs",
    },
    rollupOptions: {
      external: ["electron"],
    },
  },
  esbuild: {
    include: /\.[cm]?[jt]sx?$/,
    exclude: [],
  },
});
