
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: [
      // Exclude chunks that are causing issues in the dependency optimizer
      'chunk-HTXN6LXJ',
      'chunk-VOOPJCT5',
      'chunk-5UQEQXRT',
      'chunk-OS7NTALB',
      'chunk-GHWYJYKX',
      'chunk-DTEILMPG',
      'chunk-UDG5B74G',
      'chunk-VJI4VKJ4',
      'chunk-LGIWJDQW',
      'chunk-2M7HY3UG',
      'chunk-EFWZGOYR',
      'chunk-T5ONMTIY',
      'chunk-MEW2NBIK'
    ]
  }
}));
