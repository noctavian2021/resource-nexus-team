
// Add necessary polyfills for browser environment
import { Buffer as BufferPolyfill } from 'buffer';

// Declare custom window properties to avoid TypeScript errors
declare global {
  interface Window {
    Buffer: typeof BufferPolyfill;
    process: {
      env: { NODE_ENV: string };
      // Use any to allow browser property that doesn't exist in Node's Process interface
      browser?: boolean;
      version: string;
      versions: Record<string, string>;
    };
    __customModuleShims?: Record<string, any>;
  }
}

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || BufferPolyfill;
}

// Create shims for Node.js modules used by PDF libraries
if (typeof window !== 'undefined') {
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
if (typeof window !== 'undefined') {
  window.__customModuleShims = {
    '/node_modules/brotli/decompress.js': customBrotliShim,
  };
}
