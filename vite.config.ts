import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import gzip from "rollup-plugin-gzip";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/vdnd",
  build: {
    outDir: "./docs",
    terserOptions: {
      ecma: 5,
      compress: true,
      sourceMap: false,
    },
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  plugins: [vue(), vueJsx(), gzip()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
