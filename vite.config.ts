
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
    // Add mainFields to prefer module format
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
  },
  optimizeDeps: {
    include: [
      'base64-js',
      'unicode-properties',
      'brotli',
    ],
    exclude: [
      // Add problematic dependencies here to exclude them from optimization
      '@react-pdf/renderer',
      'embla-carousel-react',
      'vaul',
      'cmdk'
    ],
    esbuildOptions: {
      // Use proper platform setting for browser environment
      platform: 'browser',
    }
  },
  build: {
    commonjsOptions: {
      // Ensure base64-js and related packages are properly transformed
      include: [/base64-js/, /unicode-properties/, /brotli/, /node_modules/],
      transformMixedEsModules: true,
    },
  }
}));
