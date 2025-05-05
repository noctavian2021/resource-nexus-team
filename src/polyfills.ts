
// Add necessary polyfills for browser environment
import { Buffer as BufferPolyfill } from 'buffer';
import streamBrowserify from 'stream-browserify';
import cloneModule from './shims/clone-shim';
import dfaModule from './shims/dfa-shim';
import equalModule from './shims/fast-deep-equal-shim';
import tinyInflateModule from './shims/tiny-inflate-shim';
import unicodeTrieModule from './shims/unicode-trie-shim';

// Create a minimal Process interface with only the properties we need
interface MinimalProcess {
  env: { NODE_ENV: string };
  browser?: boolean;
  version: string;
  versions: Record<string, string>;
}

// Declare custom window properties to avoid TypeScript errors
declare global {
  interface Window {
    Buffer: typeof BufferPolyfill;
    process: any; // Use 'any' to avoid TypeScript errors with the process object
    __customModuleShims?: Record<string, any>;
    Stream?: any;
    clone?: any;
    dfa?: any;
    equal?: any;
    tinyInflate?: any;
    unicodeTrie?: any;
  }
}

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || BufferPolyfill;
  
  // Add stream polyfill
  if (!window.Stream) {
    window.Stream = streamBrowserify;
  }
  
  // Add clone polyfill
  if (!window.clone) {
    window.clone = cloneModule;
  }
  
  // Add dfa polyfill
  if (!window.dfa) {
    window.dfa = dfaModule;
  }

  // Add fast-deep-equal polyfill
  if (!window.equal) {
    window.equal = equalModule;
  }

  // Add tiny-inflate polyfill
  if (!window.tinyInflate) {
    window.tinyInflate = tinyInflateModule;
  }

  // Add unicode-trie polyfill
  if (!window.unicodeTrie) {
    window.unicodeTrie = unicodeTrieModule;
  }
}

// Create shims for Node.js modules used by PDF libraries
if (typeof window !== 'undefined') {
  // Define a minimal process object that won't cause type errors
  if (!window.process) {
    window.process = {
      env: { NODE_ENV: 'production' },
      browser: true,
      version: '',
      versions: {
        node: '',
        v8: '',
        uv: '',
        zlib: '',
        brotli: '',
        ares: '',
        modules: '',
        nghttp2: '',
        napi: '',
        llhttp: '',
        http_parser: '',
        openssl: '',
        cldr: '',
        icu: '',
        tz: '',
        unicode: '',
        electron: '',
      }
    }; 
  }
}

// Add brotli default export shims
const customBrotliShim = {
  __esModule: true,
  default: function() { 
    console.warn('Brotli decompress called but not fully implemented in the browser');
    return null;
  }
};

// Add stream module shims
const customStreamShim = {
  __esModule: true,
  default: streamBrowserify,
  ...streamBrowserify
};

// Add clone module shims
const customCloneShim = {
  __esModule: true,
  default: cloneModule,
  clone: cloneModule
};

// Add dfa module shims
const customDfaShim = {
  __esModule: true,
  default: dfaModule,
  ...dfaModule
};

// Add fast-deep-equal module shims
const customEqualShim = {
  __esModule: true,
  default: equalModule
};

// Add tiny-inflate module shims
const customTinyInflateShim = {
  __esModule: true,
  default: tinyInflateModule
};

// Add unicode-trie module shims
const customUnicodeTrieShim = {
  __esModule: true,
  default: unicodeTrieModule
};

// This will be used by our import interception logic in vite.config.ts
if (typeof window !== 'undefined') {
  window.__customModuleShims = {
    '/node_modules/brotli/decompress.js': customBrotliShim,
    'stream': customStreamShim,
    'stream-browserify': customStreamShim,
    'clone': customCloneShim,
    'clone/clone.js': customCloneShim,
    'dfa': customDfaShim,
    'dfa/index.js': customDfaShim,
    'fast-deep-equal': customEqualShim,
    'fast-deep-equal/index.js': customEqualShim,
    'tiny-inflate': customTinyInflateShim,
    'tiny-inflate/index.js': customTinyInflateShim,
    'unicode-trie': customUnicodeTrieShim,
    'unicode-trie/index.js': customUnicodeTrieShim
  };
}
