
// This is a browser shim for pako/lib/zlib/deflate module
import * as deflateModule from 'pako/lib/zlib/deflate';

// Re-export as both default and named exports for compatibility
export default deflateModule;

// Re-export any specific named exports if needed
export const deflateInit = deflateModule.deflateInit;
export const deflate = deflateModule.deflate;
export const deflateEnd = deflateModule.deflateEnd;
export const deflateSetDictionary = deflateModule.deflateSetDictionary;
export const deflateInfo = deflateModule.deflateInfo;
