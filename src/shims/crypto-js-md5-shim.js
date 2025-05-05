
// This is a browser shim for crypto-js/md5 module
import MD5 from 'crypto-js/md5';

// Re-export as both default and named export for compatibility
export default MD5;

// Re-export any specific named exports if needed
export const MD5 = MD5;
