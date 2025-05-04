
// Add necessary polyfills for browser environment
import { Buffer as BufferPolyfill } from 'buffer';

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || BufferPolyfill;
}

// Create shims for Node.js modules used by PDF libraries
if (typeof window !== 'undefined') {
  // @ts-ignore - Add missing global modules needed by PDF libraries
  window.process = window.process || {
    env: { NODE_ENV: 'production' },
    browser: true,
    version: '',
    versions: {},
  };
}

// Add brotli default export shims
const customBrotliShim = {
  __esModule: true,
  default: function() { 
    console.warn('Brotli decompress called but not fully implemented in the browser');
    return null;
  }
};

// This will be used by our import interception logic in vite.config.ts
window.__customModuleShims = {
  '/node_modules/brotli/decompress.js': customBrotliShim,
};
