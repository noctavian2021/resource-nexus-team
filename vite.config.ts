
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
    react({
      // Using JSX transform with correct configuration
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
