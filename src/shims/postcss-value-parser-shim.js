
// This is a browser shim for postcss-value-parser module
import postcssValueParser from 'postcss-value-parser';

// Import individual units directly from the installed package
// but don't re-export them from within the shim file
import parseFunc from 'postcss-value-parser/lib/parse.js';
import unitFunc from 'postcss-value-parser/lib/unit.js';

// Export the main module as default
export default postcssValueParser;

// Re-export all named exports from the main module
export * from 'postcss-value-parser';

// Explicitly export the parse and unit functions
export const parse = parseFunc;
export const unit = unitFunc;
