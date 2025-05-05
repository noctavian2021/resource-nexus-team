
// This is a browser shim for hsl-to-hex module
import hslToHexModule from 'hsl-to-hex';

// Re-export as both default and named exports for compatibility
export default function hslToHex(h, s, l) {
  return hslToHexModule(h, s, l);
};

// Re-export the function directly as well
export const hslToHex = hslToHexModule;
