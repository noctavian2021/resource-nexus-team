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
        // Check for dfa imports
        if (id === 'dfa' || id === 'dfa/index.js') {
          return path.resolve(__dirname, './src/shims/dfa-shim.js');
        }
        // Check for fast-deep-equal imports
        if (id === 'fast-deep-equal' || id === 'fast-deep-equal/index.js') {
          return path.resolve(__dirname, './src/shims/fast-deep-equal-shim.js');
        }
        // Check for tiny-inflate imports
        if (id === 'tiny-inflate' || id === 'tiny-inflate/index.js') {
          return path.resolve(__dirname, './src/shims/tiny-inflate-shim.js');
        }
        // Check for unicode-trie imports
        if (id === 'unicode-trie' || id === 'unicode-trie/index.js') {
          return path.resolve(__dirname, './src/shims/unicode-trie-shim.js');
        }
        // Check for cross-fetch imports
        if (id === 'cross-fetch' || id === 'cross-fetch/dist/browser-ponyfill.js') {
          return path.resolve(__dirname, './src/shims/cross-fetch-shim.js');
        }
        // Check for abs-svg-path imports
        if (id === 'abs-svg-path' || id === 'abs-svg-path/index.js') {
          return path.resolve(__dirname, './src/shims/abs-svg-path-shim.js');
        }
        // Check for color-string imports
        if (id === 'color-string' || id === 'color-string/index.js') {
          return path.resolve(__dirname, './src/shims/color-string-shim.js');
        }
        // Check for parse-svg-path imports
        if (id === 'parse-svg-path' || id === 'parse-svg-path/index.js') {
          return path.resolve(__dirname, './src/shims/parse-svg-path-shim.js');
        }
        // Check for crypto-js/md5 imports
        if (id === 'crypto-js/md5' || id === 'crypto-js/md5.js') {
          return path.resolve(__dirname, './src/shims/crypto-js-md5-shim.js');
        }
        // Check for pako/lib/zlib/zstream imports
        if (id === 'pako/lib/zlib/zstream' || id === 'pako/lib/zlib/zstream.js') {
          return path.resolve(__dirname, './src/shims/pako-zstream-shim.js');
        }
        // Check for pako/lib/zlib/deflate imports
        if (id === 'pako/lib/zlib/deflate' || id === 'pako/lib/zlib/deflate.js') {
          return path.resolve(__dirname, './src/shims/pako-deflate-shim.js');
        }
        // Check for pako/lib/zlib/inflate imports
        if (id === 'pako/lib/zlib/inflate' || id === 'pako/lib/zlib/inflate.js') {
          return path.resolve(__dirname, './src/shims/pako-inflate-shim.js');
        }
        // Check for pako/lib/zlib/constants imports
        if (id === 'pako/lib/zlib/constants' || id === 'pako/lib/zlib/constants.js') {
          return path.resolve(__dirname, './src/shims/pako-constants-shim.js');
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
        // Handle dfa module
        if (id.includes('dfa') && !id.includes('dfa-shim')) {
          return {
            code: `
              import dfaShim from '${path.resolve(__dirname, './src/shims/dfa-shim.js')}';
              export default dfaShim;
              export const DFA = dfaShim.DFA;
            `,
            map: null
          };
        }
        // Handle fast-deep-equal module
        if (id.includes('fast-deep-equal') && !id.includes('fast-deep-equal-shim')) {
          return {
            code: `
              import equalShim from '${path.resolve(__dirname, './src/shims/fast-deep-equal-shim.js')}';
              export default equalShim;
            `,
            map: null
          };
        }
        // Handle tiny-inflate module
        if (id.includes('tiny-inflate') && !id.includes('tiny-inflate-shim')) {
          return {
            code: `
              import tinyInflateShim from '${path.resolve(__dirname, './src/shims/tiny-inflate-shim.js')}';
              export default tinyInflateShim;
            `,
            map: null
          };
        }
        // Handle unicode-trie module
        if (id.includes('unicode-trie') && !id.includes('unicode-trie-shim')) {
          return {
            code: `
              import unicodeTrieShim from '${path.resolve(__dirname, './src/shims/unicode-trie-shim.js')}';
              export default unicodeTrieShim;
            `,
            map: null
          };
        }
        // Handle cross-fetch module
        if (id.includes('cross-fetch') && !id.includes('cross-fetch-shim')) {
          return {
            code: `
              import crossFetchShim, { fetch, Headers, Request, Response } from '${path.resolve(__dirname, './src/shims/cross-fetch-shim.js')}';
              export default crossFetchShim;
              export { fetch, Headers, Request, Response };
            `,
            map: null
          };
        }
        // Handle abs-svg-path module
        if (id.includes('abs-svg-path') && !id.includes('abs-svg-path-shim')) {
          return {
            code: `
              import absSvgPathShim from '${path.resolve(__dirname, './src/shims/abs-svg-path-shim.js')}';
              export default absSvgPathShim;
            `,
            map: null
          };
        }
        // Handle color-string module
        if (id.includes('color-string') && !id.includes('color-string-shim')) {
          return {
            code: `
              import colorStringShim from '${path.resolve(__dirname, './src/shims/color-string-shim.js')}';
              export default colorStringShim;
            `,
            map: null
          };
        }
        // Handle parse-svg-path module
        if (id.includes('parse-svg-path') && !id.includes('parse-svg-path-shim')) {
          return {
            code: `
              import parseSvgPathShim from '${path.resolve(__dirname, './src/shims/parse-svg-path-shim.js')}';
              export default parseSvgPathShim;
            `,
            map: null
          };
        }
        // Handle crypto-js/md5 module
        if (id.includes('crypto-js/md5') && !id.includes('crypto-js-md5-shim')) {
          return {
            code: `
              import md5Shim, { MD5 } from '${path.resolve(__dirname, './src/shims/crypto-js-md5-shim.js')}';
              export default md5Shim;
              export { MD5 };
            `,
            map: null
          };
        }
        // Handle pako/lib/zlib/zstream module
        if (id.includes('pako/lib/zlib/zstream') && !id.includes('pako-zstream-shim')) {
          return {
            code: `
              import pakoZstreamShim, { ZStream } from '${path.resolve(__dirname, './src/shims/pako-zstream-shim.js')}';
              export default pakoZstreamShim;
              export { ZStream };
            `,
            map: null
          };
        }
        // Handle pako/lib/zlib/deflate module
        if (id.includes('pako/lib/zlib/deflate') && !id.includes('pako-deflate-shim')) {
          return {
            code: `
              import pakoDeflateShim, { deflateInit, deflate, deflateEnd, deflateSetDictionary, deflateInfo } from '${path.resolve(__dirname, './src/shims/pako-deflate-shim.js')}';
              export default pakoDeflateShim;
              export { deflateInit, deflate, deflateEnd, deflateSetDictionary, deflateInfo };
            `,
            map: null
          };
        }
        // Handle pako/lib/zlib/inflate module
        if (id.includes('pako/lib/zlib/inflate') && !id.includes('pako-inflate-shim')) {
          return {
            code: `
              import pakoInflateShim, { inflateInit, inflate, inflateEnd, inflateSetDictionary, inflateInfo } from '${path.resolve(__dirname, './src/shims/pako-inflate-shim.js')}';
              export default pakoInflateShim;
              export { inflateInit, inflate, inflateEnd, inflateSetDictionary, inflateInfo };
            `,
            map: null
          };
        }
        // Handle pako/lib/zlib/constants module
        if (id.includes('pako/lib/zlib/constants') && !id.includes('pako-constants-shim')) {
          return {
            code: `
              import pakoConstantsShim, { 
                Z_NO_FLUSH, Z_PARTIAL_FLUSH, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH, 
                Z_BLOCK, Z_TREES, Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_ERRNO, Z_STREAM_ERROR,
                Z_DATA_ERROR, Z_MEM_ERROR, Z_BUF_ERROR, Z_VERSION_ERROR, Z_NO_COMPRESSION,
                Z_BEST_SPEED, Z_BEST_COMPRESSION, Z_DEFAULT_COMPRESSION, Z_FILTERED,
                Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY, Z_BINARY, Z_TEXT,
                Z_UNKNOWN, Z_DEFLATED
              } from '${path.resolve(__dirname, './src/shims/pako-constants-shim.js')}';
              export default pakoConstantsShim;
              export { 
                Z_NO_FLUSH, Z_PARTIAL_FLUSH, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH, 
                Z_BLOCK, Z_TREES, Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_ERRNO, Z_STREAM_ERROR,
                Z_DATA_ERROR, Z_MEM_ERROR, Z_BUF_ERROR, Z_VERSION_ERROR, Z_NO_COMPRESSION,
                Z_BEST_SPEED, Z_BEST_COMPRESSION, Z_DEFAULT_COMPRESSION, Z_FILTERED,
                Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY, Z_BINARY, Z_TEXT,
                Z_UNKNOWN, Z_DEFLATED
              };
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
      "clone/clone.js": path.resolve(__dirname, './src/shims/clone-shim.js'),
      // Add direct alias for dfa
      "dfa": path.resolve(__dirname, './src/shims/dfa-shim.js'),
      "dfa/index.js": path.resolve(__dirname, './src/shims/dfa-shim.js'),
      // Add direct alias for fast-deep-equal
      "fast-deep-equal": path.resolve(__dirname, './src/shims/fast-deep-equal-shim.js'),
      "fast-deep-equal/index.js": path.resolve(__dirname, './src/shims/fast-deep-equal-shim.js'),
      // Add direct alias for tiny-inflate
      "tiny-inflate": path.resolve(__dirname, './src/shims/tiny-inflate-shim.js'),
      "tiny-inflate/index.js": path.resolve(__dirname, './src/shims/tiny-inflate-shim.js'),
      // Add direct alias for unicode-trie
      "unicode-trie": path.resolve(__dirname, './src/shims/unicode-trie-shim.js'),
      "unicode-trie/index.js": path.resolve(__dirname, './src/shims/unicode-trie-shim.js'),
      // Add direct alias for cross-fetch
      "cross-fetch": path.resolve(__dirname, './src/shims/cross-fetch-shim.js'),
      "cross-fetch/dist/browser-ponyfill.js": path.resolve(__dirname, './src/shims/cross-fetch-shim.js'),
      // Add direct alias for abs-svg-path
      "abs-svg-path": path.resolve(__dirname, './src/shims/abs-svg-path-shim.js'),
      "abs-svg-path/index.js": path.resolve(__dirname, './src/shims/abs-svg-path-shim.js'),
      // Add direct alias for color-string
      "color-string": path.resolve(__dirname, './src/shims/color-string-shim.js'),
      "color-string/index.js": path.resolve(__dirname, './src/shims/color-string-shim.js'),
      // Add direct alias for parse-svg-path
      "parse-svg-path": path.resolve(__dirname, './src/shims/parse-svg-path-shim.js'),
      "parse-svg-path/index.js": path.resolve(__dirname, './src/shims/parse-svg-path-shim.js'),
      // Add direct alias for crypto-js/md5
      "crypto-js/md5": path.resolve(__dirname, './src/shims/crypto-js-md5-shim.js'),
      "crypto-js/md5.js": path.resolve(__dirname, './src/shims/crypto-js-md5-shim.js'),
      // Add direct alias for pako/lib/zlib/zstream
      "pako/lib/zlib/zstream": path.resolve(__dirname, './src/shims/pako-zstream-shim.js'),
      "pako/lib/zlib/zstream.js": path.resolve(__dirname, './src/shims/pako-zstream-shim.js'),
      // Add direct alias for pako/lib/zlib/deflate
      "pako/lib/zlib/deflate": path.resolve(__dirname, './src/shims/pako-deflate-shim.js'),
      "pako/lib/zlib/deflate.js": path.resolve(__dirname, './src/shims/pako-deflate-shim.js'),
      // Add direct alias for pako/lib/zlib/inflate
      "pako/lib/zlib/inflate": path.resolve(__dirname, './src/shims/pako-inflate-shim.js'),
      "pako/lib/zlib/inflate.js": path.resolve(__dirname, './src/shims/pako-inflate-shim.js'),
      // Add direct alias for pako/lib/zlib/constants
      "pako/lib/zlib/constants": path.resolve(__dirname, './src/shims/pako-constants-shim.js'),
      "pako/lib/zlib/constants.js": path.resolve(__dirname, './src/shims/pako-constants-shim.js')
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
      'dfa', // Add dfa to include
      'fast-deep-equal', // Add fast-deep-equal to include
      'tiny-inflate', // Add tiny-inflate to include
      'unicode-trie', // Add unicode-trie to include
      'cross-fetch', // Add cross-fetch to include
      'abs-svg-path', // Add abs-svg-path to include
      'color-string', // Add color-string to include
      'parse-svg-path', // Add parse-svg-path to include
      'crypto-js/md5', // Add crypto-js/md5 to include
      'pako/lib/zlib/zstream', // Add pako/lib/zlib/zstream to include
      'pako/lib/zlib/deflate', // Add pako/lib/zlib/deflate to include
      'pako/lib/zlib/inflate', // Add pako/lib/zlib/inflate to include
      'pako/lib/zlib/constants', // Add pako/lib/zlib/constants to include
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
