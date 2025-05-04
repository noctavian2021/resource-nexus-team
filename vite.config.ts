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
    // Add plugin to intercept problematic imports
    {
      name: 'module-shim',
      enforce: 'pre',
      resolveId(id) {
        // Return the id unchanged to let Vite handle it
        // but mark brotli modules for special handling
        if (id.includes('brotli/decompress')) {
          return {
            id,
            moduleSideEffects: false,
          };
        }
        return null;
      },
      transform(code, id) {
        // Handle specific problematic modules
        if (id.includes('brotli/decompress')) {
          // Export a shimmed version that won't break the build
          return {
            code: `
              export default function decompress() {
                console.warn('Brotli decompress called but not fully implemented in the browser');
                return null;
              };
              export const decompress = function() {
                console.warn('Brotli decompress called but not fully implemented in the browser');
                return null;
              };
            `,
            map: null
          };
        }
        return null;
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add aliases for problematic Node.js built-ins
      stream: 'stream-browserify',
      path: 'path-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
      buffer: 'buffer',
      process: 'process/browser',
      crypto: 'crypto-browserify',
      fs: false,
      os: false,
    },
    // Add mainFields to prefer module format
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main'],
  },
  optimizeDeps: {
    include: [
      'base64-js',
      'unicode-properties',
      'brotli',
      'buffer',
      'process/browser',
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
      supported: {
        // Add specific browser features that should be considered supported
        bigint: true,
      },
      define: {
        global: 'globalThis',
      },
    }
  },
  build: {
    commonjsOptions: {
      // Ensure base64-js and related packages are properly transformed
      include: [/base64-js/, /unicode-properties/, /brotli/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Explicitly external modules that shouldn't be bundled
      external: [],
      output: {
        manualChunks: {
          // Split large vendor packages
          'react-vendor': ['react', 'react-dom'],
          'pdf-lib': ['@react-pdf/renderer'],
        },
      },
    },
  },
  define: {
    // Polyfill global for modules that expect it
    global: 'globalThis',
    'process.env': {},
  }
}));
