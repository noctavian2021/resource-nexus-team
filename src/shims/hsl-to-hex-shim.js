
// This is a browser shim for hsl-to-hex module
import hslToHexModule from 'hsl-to-hex';

// Export the original module as default
export default hslToHexModule;

// We don't need to re-export the named export since it would conflict with the default function
