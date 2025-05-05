
// This is a browser shim for pako/lib/zlib/zstream module
import * as zstreamModule from 'pako/lib/zlib/zstream';

// Re-export as both default and named exports for compatibility
export default zstreamModule;

// Re-export any specific named exports if needed
export const ZStream = zstreamModule.ZStream;
