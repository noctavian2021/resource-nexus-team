
// This is a browser shim for pako/lib/zlib/constants module
import * as constantsModule from 'pako/lib/zlib/constants';

// Re-export as both default and named exports for compatibility
export default constantsModule;

// Re-export any specific named exports if needed
export const Z_NO_FLUSH = constantsModule.Z_NO_FLUSH;
export const Z_PARTIAL_FLUSH = constantsModule.Z_PARTIAL_FLUSH;
export const Z_SYNC_FLUSH = constantsModule.Z_SYNC_FLUSH;
export const Z_FULL_FLUSH = constantsModule.Z_FULL_FLUSH;
export const Z_FINISH = constantsModule.Z_FINISH;
export const Z_BLOCK = constantsModule.Z_BLOCK;
export const Z_TREES = constantsModule.Z_TREES;
export const Z_OK = constantsModule.Z_OK;
export const Z_STREAM_END = constantsModule.Z_STREAM_END;
export const Z_NEED_DICT = constantsModule.Z_NEED_DICT;
export const Z_ERRNO = constantsModule.Z_ERRNO;
export const Z_STREAM_ERROR = constantsModule.Z_STREAM_ERROR;
export const Z_DATA_ERROR = constantsModule.Z_DATA_ERROR;
export const Z_MEM_ERROR = constantsModule.Z_MEM_ERROR;
export const Z_BUF_ERROR = constantsModule.Z_BUF_ERROR;
export const Z_VERSION_ERROR = constantsModule.Z_VERSION_ERROR;
export const Z_NO_COMPRESSION = constantsModule.Z_NO_COMPRESSION;
export const Z_BEST_SPEED = constantsModule.Z_BEST_SPEED;
export const Z_BEST_COMPRESSION = constantsModule.Z_BEST_COMPRESSION;
export const Z_DEFAULT_COMPRESSION = constantsModule.Z_DEFAULT_COMPRESSION;
export const Z_FILTERED = constantsModule.Z_FILTERED;
export const Z_HUFFMAN_ONLY = constantsModule.Z_HUFFMAN_ONLY;
export const Z_RLE = constantsModule.Z_RLE;
export const Z_FIXED = constantsModule.Z_FIXED;
export const Z_DEFAULT_STRATEGY = constantsModule.Z_DEFAULT_STRATEGY;
export const Z_BINARY = constantsModule.Z_BINARY;
export const Z_TEXT = constantsModule.Z_TEXT;
export const Z_UNKNOWN = constantsModule.Z_UNKNOWN;
export const Z_DEFLATED = constantsModule.Z_DEFLATED;
