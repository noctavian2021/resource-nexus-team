
// This is a browser shim for hyphen module
import * as hyphenModule from 'hyphen';

// Export the module as both default and named exports
const hyphenShim = { ...hyphenModule };

// Export everything from the original module
export * from 'hyphen';

// Export a default export to satisfy imports that expect a default export
export default hyphenShim;
