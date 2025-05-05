
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
      "base64-js": path.resolve(__dirname, "node_modules/base64-js")
    },
  },
  optimizeDeps: {
    include: ["base64-js"],
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
      include: [/base64-js/, /unicode-properties/, /node_modules/]
    }
  }
}));
