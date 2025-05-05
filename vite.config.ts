
import { defineConfig, ConfigEnv, Plugin, UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => ({
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
      enforce: 'pre' as const, // Explicitly type as 'pre'
      resolveId(id: string) {
        // Check for brotli imports
        if (id.includes('brotli/decompress')) {
          // Return a resolved path to our local shim
          return path.resolve(__dirname, './src/shims/brotli-shim.js');
        }
        // Check for clone imports
        if (id === 'clone' || id === 'clone/clone.js') {
          return path.resolve(__dirname, './src/shims/clone-shim.js');
        }
        return null;
      },
      transform(code: string, id: string) {
        // Handle specific problematic modules
        if (id.includes('brotli/decompress')) {
          // Export a shimmed version that won't break the build
          return {
            code: `
              export default function decompress() {
                console.warn('Brotli decompress called but not fully implemented in the browser');
                return null;
              };
              export { decompress };
            `,
            map: null
          };
        }
        // Handle clone module
        if (id.includes('clone') && !id.includes('clone-shim')) {
          return {
            code: `
              import actualClone from '${path.resolve(__dirname, './src/shims/clone-shim.js')}';
              export default actualClone;
              export const clone = actualClone;
            `,
            map: null
          };
        }
        return null;
      }
    }
  ].filter(Boolean) as Plugin[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add aliases for problematic Node.js built-ins
      "stream": 'stream-browserify',
      "path": 'path-browserify',
      "zlib": 'browserify-zlib',
      "util": 'util',
      "buffer": 'buffer',
      "process": 'process/browser',
      "crypto": 'crypto-browserify',
      // Use empty module for Node.js built-ins that don't have browser equivalents
      "fs": '',
      "os": '',
      // Add direct alias for brotli
      "brotli/decompress": path.resolve(__dirname, './src/shims/brotli-shim.js'),
      // Add direct alias for clone
      "clone": path.resolve(__dirname, './src/shims/clone-shim.js'),
      "clone/clone.js": path.resolve(__dirname, './src/shims/clone-shim.js')
    },
    // Add mainFields to prefer module format
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main'],
  },
  optimizeDeps: {
    include: [
      'base64-js',
      'unicode-properties',
      'buffer',
      'process/browser',
      'stream-browserify',  // Add stream-browserify to include
      'clone', // Add clone to include
    ],
    exclude: [
      // Add problematic dependencies here to exclude them from optimization
      '@react-pdf/renderer',
      'embla-carousel-react',
      'vaul',
      'cmdk',
      'brotli', // Exclude brotli from optimization
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
      include: [/base64-js/, /unicode-properties/, /node_modules/],
      transformMixedEsModules: true,
      // Skip problematic modules during build
      ignore: ['brotli']
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
