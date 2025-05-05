
// This is a browser shim for hyphen module
import * as hyphenModule from 'hyphen';

// Create a proper module with both named and default exports
const hyphenShim = { ...hyphenModule };

// Make sure we handle the patterns properly
// Create a mock for the patterns that might be imported
hyphenShim.patterns = {
  'en-us': {}
};

// Add a patterns property that returns mock pattern data
Object.defineProperty(hyphenShim, 'patterns', {
  get: function() {
    return {
      'en-us': {}
    };
  }
});

// Re-export all named exports from hyphen
export * from 'hyphen';

// Export default for modules that expect it
export default hyphenShim;
