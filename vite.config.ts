
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Configure API proxy to forward to the email server
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep the original path structure
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        }
      },
    },
  },
  plugins: [
    react({
      jsxImportSource: "react",
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime"),
      "react": path.resolve(__dirname, "node_modules/react"),
    },
  },
  define: {
    // Define any environment variables the app needs
    // This replaces process.env references at build time
    'import.meta.env.VITE_API_URL': JSON.stringify('https://api.example.com'),
  },
  optimizeDeps: {
    include: [
      'postcss-value-parser',
      'media-engine',
      'react',
      'react-dom',
      'react/jsx-runtime'
    ],
    esbuildOptions: {
      jsx: 'automatic',
    },
  },
  build: {
    commonjsOptions: {
      include: [/postcss-value-parser/, /media-engine/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: [],
    }
  }
}));
