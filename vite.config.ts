
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
      "dfa": path.resolve(__dirname, "node_modules/dfa"),
      // Fix for fast-deep-equal import issues
      "fast-deep-equal": path.resolve(__dirname, "node_modules/fast-deep-equal"),
      // Fix for tiny-inflate import issues
      "tiny-inflate": path.resolve(__dirname, "node_modules/tiny-inflate"),
      // Additional aliases for common problem packages with @react-pdf
      "unicode-properties": path.resolve(__dirname, "node_modules/unicode-properties"),
      "restructure": path.resolve(__dirname, "node_modules/restructure"),
      "fontkit": path.resolve(__dirname, "node_modules/fontkit"),
      "linebreak": path.resolve(__dirname, "node_modules/linebreak"),
      // Additional aliases for other potential problematic modules
      "@babel/runtime": path.resolve(__dirname, "node_modules/@babel/runtime"),
      "buffer": path.resolve(__dirname, "node_modules/buffer"),
      "pdfkit": path.resolve(__dirname, "node_modules/pdfkit"),
      // Fix for cross-fetch import issues
      "cross-fetch": path.resolve(__dirname, "node_modules/cross-fetch"),
      // Fix for abs-svg-path import issues
      "abs-svg-path": path.resolve(__dirname, "node_modules/abs-svg-path"),
      // Fix for color-string import issues
      "color-string": path.resolve(__dirname, "node_modules/color-string"),
      // Fix for parse-svg-path import issues
      "parse-svg-path": path.resolve(__dirname, "node_modules/parse-svg-path")
    },
  },
  optimizeDeps: {
    include: [
      "base64-js", 
      "unicode-trie", 
      "brotli", 
      "clone", 
      "dfa", 
      "fast-deep-equal", 
      "tiny-inflate",
      "unicode-properties",
      "restructure",
      "linebreak",
      "fontkit",
      "cross-fetch",
      "abs-svg-path",
      "color-string",
      "parse-svg-path"
    ],
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
      include: [
        /base64-js/, 
        /unicode-trie/, 
        /unicode-properties/, 
        /brotli/, 
        /clone/, 
        /dfa/, 
        /fast-deep-equal/, 
        /tiny-inflate/,
        /restructure/,
        /linebreak/,
        /fontkit/,
        /@babel\/runtime/,
        /buffer/,
        /pdfkit/,
        /cross-fetch/,
        /abs-svg-path/,
        /color-string/,
        /parse-svg-path/,
        /node_modules/
      ]
    }
  }
}));
