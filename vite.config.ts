
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
      // Fix for base64-js import issues
      "base64-js": path.resolve(__dirname, "node_modules/base64-js"),
      // Fix for unicode-trie import issues
      "unicode-trie": path.resolve(__dirname, "node_modules/unicode-trie"),
      // Fix for brotli import issues
      "brotli": path.resolve(__dirname, "node_modules/brotli"),
      // Fix for clone import issues
      "clone": path.resolve(__dirname, "node_modules/clone"),
      // Fix for dfa import issues
      "dfa": path.resolve(__dirname, "node_modules/dfa")
    },
  },
  optimizeDeps: {
    include: ["base64-js", "unicode-trie", "brotli", "clone", "dfa"],
    exclude: [
      // Add problematic dependencies here to exclude them from optimization
      '@react-pdf/renderer',
      'embla-carousel-react',
      'vaul',
      'cmdk'
    ]
  },
  build: {
    commonjsOptions: {
      // Handle CommonJS dependencies properly
      transformMixedEsModules: true,
      include: [/base64-js/, /unicode-trie/, /unicode-properties/, /brotli/, /clone/, /dfa/, /node_modules/]
    }
  }
}));
