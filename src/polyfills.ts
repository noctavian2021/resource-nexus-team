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
import pakoZstreamModule from './shims/pako-zstream-shim';
import pakoDeflateModule from './shims/pako-deflate-shim';
import pakoInflateModule from './shims/pako-inflate-shim';
import pakoConstantsModule from './shims/pako-constants-shim';
import hslToHexModule from './shims/hsl-to-hex-shim';
import mediaEngineModule from './shims/media-engine-shim';
import postcssValueParserModule from './shims/postcss-value-parser-shim';

console.log('Polyfills loaded:', {
  pakoZstream: pakoZstreamModule,
  pakoDeflate: pakoDeflateModule,
  pakoInflate: pakoInflateModule,
  pakoConstants: pakoConstantsModule,
  md5Module: md5Module,
  hslToHex: hslToHexModule,
  mediaEngine: mediaEngineModule,
  postcssValueParser: postcssValueParserModule
});

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
    pakoZstream?: any;
    pakoDeflate?: any;
    pakoInflate?: any;
    pakoConstants?: any;
    hslToHex?: any;
    mediaEngine?: any;
    postcssValueParser?: any;
    postcssValueParserParse?: any;
    postcssValueParserUnit?: any;
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
  
  // Add pako zstream polyfill
  if (!window.pakoZstream) {
    window.pakoZstream = pakoZstreamModule;
    console.log('Added pako zstream polyfill to window', pakoZstreamModule);
  }
  
  // Add pako deflate polyfill
  if (!window.pakoDeflate) {
    window.pakoDeflate = pakoDeflateModule;
    console.log('Added pako deflate polyfill to window', pakoDeflateModule);
  }
  
  // Add pako inflate polyfill
  if (!window.pakoInflate) {
    window.pakoInflate = pakoInflateModule;
    console.log('Added pako inflate polyfill to window', pakoInflateModule);
  }
  
  // Add pako constants polyfill
  if (!window.pakoConstants) {
    window.pakoConstants = pakoConstantsModule;
    console.log('Added pako constants polyfill to window', pakoConstantsModule);
  }
  
  // Add hsl-to-hex polyfill
  if (!window.hslToHex) {
    window.hslToHex = hslToHexModule;
    console.log('Added hsl-to-hex polyfill to window', hslToHexModule);
  }
  
  // Add media-engine polyfill
  if (!window.mediaEngine) {
    window.mediaEngine = mediaEngineModule;
    console.log('Added media-engine polyfill to window', mediaEngineModule);
  }
  
  // Add postcss-value-parser polyfill
  if (!window.postcssValueParser) {
    window.postcssValueParser = postcssValueParserModule;
    window.postcssValueParserParse = postcssValueParserModule.parse;
    window.postcssValueParserUnit = postcssValueParserModule.unit;
    
    // Make the parse and unit functions available at the expected paths
    // This is important for libraries that expect specific paths
    if (!window.postcssValueParser.lib) {
      window.postcssValueParser.lib = {
        parse: postcssValueParserModule.parse,
        unit: postcssValueParserModule.unit
      };
    }
    
    console.log('Added postcss-value-parser polyfill to window', postcssValueParserModule);
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

// Add pako zstream module shims
const customPakoZstreamShim = {
  __esModule: true,
  default: pakoZstreamModule,
  ZStream: pakoZstreamModule.ZStream
};

// Add pako deflate module shims
const customPakoDeflateShim = {
  __esModule: true,
  default: pakoDeflateModule,
  deflateInit: pakoDeflateModule.deflateInit,
  deflate: pakoDeflateModule.deflate,
  deflateEnd: pakoDeflateModule.deflateEnd,
  deflateSetDictionary: pakoDeflateModule.deflateSetDictionary,
  deflateInfo: pakoDeflateModule.deflateInfo
};

// Add pako inflate module shims
const customPakoInflateShim = {
  __esModule: true,
  default: pakoInflateModule,
  inflateInit: pakoInflateModule.inflateInit,
  inflate: pakoInflateModule.inflate,
  inflateEnd: pakoInflateModule.inflateEnd,
  inflateSetDictionary: pakoInflateModule.inflateSetDictionary,
  inflateInfo: pakoInflateModule.inflateInfo
};

// Add pako constants module shims
const customPakoConstantsShim = {
  __esModule: true,
  default: pakoConstantsModule,
  Z_NO_FLUSH: pakoConstantsModule.Z_NO_FLUSH,
  Z_PARTIAL_FLUSH: pakoConstantsModule.Z_PARTIAL_FLUSH,
  Z_SYNC_FLUSH: pakoConstantsModule.Z_SYNC_FLUSH,
  Z_FULL_FLUSH: pakoConstantsModule.Z_FULL_FLUSH,
  Z_FINISH: pakoConstantsModule.Z_FINISH,
  Z_BLOCK: pakoConstantsModule.Z_BLOCK,
  Z_TREES: pakoConstantsModule.Z_TREES,
  Z_OK: pakoConstantsModule.Z_OK,
  Z_STREAM_END: pakoConstantsModule.Z_STREAM_END,
  Z_NEED_DICT: pakoConstantsModule.Z_NEED_DICT,
  Z_ERRNO: pakoConstantsModule.Z_ERRNO,
  Z_STREAM_ERROR: pakoConstantsModule.Z_STREAM_ERROR,
  Z_DATA_ERROR: pakoConstantsModule.Z_DATA_ERROR,
  Z_MEM_ERROR: pakoConstantsModule.Z_MEM_ERROR,
  Z_BUF_ERROR: pakoConstantsModule.Z_BUF_ERROR,
  Z_VERSION_ERROR: pakoConstantsModule.Z_VERSION_ERROR,
  Z_NO_COMPRESSION: pakoConstantsModule.Z_NO_COMPRESSION,
  Z_BEST_SPEED: pakoConstantsModule.Z_BEST_SPEED,
  Z_BEST_COMPRESSION: pakoConstantsModule.Z_BEST_COMPRESSION,
  Z_DEFAULT_COMPRESSION: pakoConstantsModule.Z_DEFAULT_COMPRESSION,
  Z_FILTERED: pakoConstantsModule.Z_FILTERED,
  Z_HUFFMAN_ONLY: pakoConstantsModule.Z_HUFFMAN_ONLY,
  Z_RLE: pakoConstantsModule.Z_RLE,
  Z_FIXED: pakoConstantsModule.Z_FIXED,
  Z_DEFAULT_STRATEGY: pakoConstantsModule.Z_DEFAULT_STRATEGY,
  Z_BINARY: pakoConstantsModule.Z_BINARY,
  Z_TEXT: pakoConstantsModule.Z_TEXT,
  Z_UNKNOWN: pakoConstantsModule.Z_UNKNOWN,
  Z_DEFLATED: pakoConstantsModule.Z_DEFLATED
};

// Add hsl-to-hex default export shims
const customHslToHexShim = {
  __esModule: true,
  default: hslToHexModule,
  hslToHex: hslToHexModule
};

// Add media-engine module shims
const customMediaEngineShim = {
  __esModule: true,
  default: mediaEngineModule,
  ...mediaEngineModule
};

// Add postcss-value-parser module shims
const customPostcssValueParserShim = {
  __esModule: true,
  default: postcssValueParserModule,
  ...postcssValueParserModule,
  parse: postcssValueParserModule.parse,
  unit: postcssValueParserModule.unit,
  lib: {
    parse: postcssValueParserModule.parse,
    unit: postcssValueParserModule.unit
  }
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
    'crypto-js/md5.js': customMd5Shim,
    'pako/lib/zlib/zstream': customPakoZstreamShim,
    'pako/lib/zlib/zstream.js': customPakoZstreamShim,
    'pako/lib/zlib/deflate': customPakoDeflateShim,
    'pako/lib/zlib/deflate.js': customPakoDeflateShim,
    'pako/lib/zlib/inflate': customPakoInflateShim,
    'pako/lib/zlib/inflate.js': customPakoInflateShim,
    'pako/lib/zlib/constants': customPakoConstantsShim,
    'pako/lib/zlib/constants.js': customPakoConstantsShim,
    'hsl-to-hex': customHslToHexShim,
    'hsl-to-hex/index.js': customHslToHexShim,
    'media-engine': customMediaEngineShim,
    'media-engine/src/index.js': customMediaEngineShim,
    'postcss-value-parser': customPostcssValueParserShim,
    'postcss-value-parser/lib/index.js': customPostcssValueParserShim,
    'postcss-value-parser/lib/parse.js': { 
      __esModule: true, 
      default: postcssValueParserModule.parse,
      parse: postcssValueParserModule.parse
    },
    'postcss-value-parser/lib/unit.js': { 
      __esModule: true, 
      default: postcssValueParserModule.unit,
      unit: postcssValueParserModule.unit
    },
    // Add explicit paths that might be used by @react-pdf/stylesheet
    'postcss-value-parser/lib/parse': { 
      __esModule: true, 
      default: postcssValueParserModule.parse,
      parse: postcssValueParserModule.parse
    },
    'postcss-value-parser/lib/unit': { 
      __esModule: true, 
      default: postcssValueParserModule.unit,
      unit: postcssValueParserModule.unit
    }
  };
}
