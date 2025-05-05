
// This is a browser shim for brotli
export default function decompress() {
  console.warn('Brotli decompress called but not fully implemented in the browser');
  return null;
}

export const decompress = function() {
  console.warn('Brotli decompress called but not fully implemented in the browser');
  return null;
};
