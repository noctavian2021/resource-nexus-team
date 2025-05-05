
// This is a browser shim for crypto-js/md5 module
import * as MD5Module from 'crypto-js/md5';

// Re-export as both default and named export for compatibility
export default MD5Module;

// Re-export any specific named exports if needed
export const MD5 = MD5Module;
