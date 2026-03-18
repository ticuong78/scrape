import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "electron/main.cts",
      formats: ["cjs"],
      fileName: () => "main.cjs",
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
