
// This is a browser shim for pako/lib/zlib/inflate module
import * as inflateModule from 'pako/lib/zlib/inflate';

// Re-export as both default and named exports for compatibility
export default inflateModule;

// Re-export any specific named exports if needed
export const inflateInit = inflateModule.inflateInit;
export const inflate = inflateModule.inflate;
export const inflateEnd = inflateModule.inflateEnd;
export const inflateSetDictionary = inflateModule.inflateSetDictionary;
export const inflateInfo = inflateModule.inflateInfo;
