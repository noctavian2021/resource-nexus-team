
// This is a browser shim for brotli
function decompress() {
  console.warn('Brotli decompress called but not fully implemented in the browser');
  return null;
}

// Export both default and named export for maximum compatibility
// without declaring 'decompress' twice
export default decompress;
export { decompress };
