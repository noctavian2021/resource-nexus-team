
// This is a browser shim for brotli
export default function decompress() {
  console.warn('Brotli decompress called but not fully implemented in the browser');
  return null;
}

// Also export named export for CommonJS compatibility
export const decompress = function() {
  console.warn('Brotli decompress called but not fully implemented in the browser');
  return null;
};
