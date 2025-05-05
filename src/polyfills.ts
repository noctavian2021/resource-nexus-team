// Add necessary polyfills for browser environment
import { Buffer as BufferPolyfill } from 'buffer';
import streamBrowserify from 'stream-browserify';
import cloneModule from './shims/clone-shim';
import dfaModule from './shims/dfa-shim';
import equalModule from './shims/fast-deep-equal-shim';
import tinyInflateModule from './shims/tiny-inflate-shim';
import unicodeTrieModule from './shims/unicode-trie-shim';
import crossFetchModule from './shims/cross-fetch-shim';
import absSvgPathModule from './shims/abs-svg-path-shim';
import colorStringModule from './shims/color-string-shim';
import parseSvgPathModule from './shims/parse-svg-path-shim';
import md5Module from './shims/crypto-js-md5-shim';

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
    crossFetch?: any;
    absSvgPath?: any;
    colorString?: any;
    parseSvgPath?: any;
    md5?: any;
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
  
  // Add cross-fetch polyfill
  if (!window.crossFetch) {
    window.crossFetch = crossFetchModule;
  }
  
  // Add abs-svg-path polyfill
  if (!window.absSvgPath) {
    window.absSvgPath = absSvgPathModule;
  }
  
  // Add color-string polyfill
  if (!window.colorString) {
    window.colorString = colorStringModule;
  }
  
  // Add parse-svg-path polyfill
  if (!window.parseSvgPath) {
    window.parseSvgPath = parseSvgPathModule;
  }
  
  // Add md5 polyfill
  if (!window.md5) {
    window.md5 = md5Module;
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

// Add cross-fetch module shims
const customCrossFetchShim = {
  __esModule: true,
  default: crossFetchModule,
  fetch: crossFetchModule.fetch,
  Headers: crossFetchModule.Headers,
  Request: crossFetchModule.Request,
  Response: crossFetchModule.Response
};

// Add abs-svg-path module shims
const customAbsSvgPathShim = {
  __esModule: true,
  default: absSvgPathModule
};

// Add color-string module shims
const customColorStringShim = {
  __esModule: true,
  default: colorStringModule
};

// Add parse-svg-path module shims
const customParseSvgPathShim = {
  __esModule: true,
  default: parseSvgPathModule
};

// Add md5 module shims
const customMd5Shim = {
  __esModule: true,
  default: md5Module,
  MD5: md5Module
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
    'unicode-trie/index.js': customUnicodeTrieShim,
    'cross-fetch': customCrossFetchShim,
    'cross-fetch/dist/browser-ponyfill.js': customCrossFetchShim,
    'abs-svg-path': customAbsSvgPathShim,
    'abs-svg-path/index.js': customAbsSvgPathShim,
    'color-string': customColorStringShim,
    'color-string/index.js': customColorStringShim,
    'parse-svg-path': customParseSvgPathShim,
    'parse-svg-path/index.js': customParseSvgPathShim,
    'crypto-js/md5': customMd5Shim,
    'crypto-js/md5.js': customMd5Shim
  };
}
