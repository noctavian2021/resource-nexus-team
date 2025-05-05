
// This is a browser shim for postcss-value-parser module
import * as postcssValueParserModule from 'postcss-value-parser';
import parseModule from 'postcss-value-parser/lib/parse';
import unitModule from 'postcss-value-parser/lib/unit';

// Export the module as default
export default postcssValueParserModule;

// Re-export all named exports
export * from 'postcss-value-parser';

// Explicitly export the parse module that's being imported
export const parse = parseModule;
export { default as parse } from 'postcss-value-parser/lib/parse';
export { default as unit } from 'postcss-value-parser/lib/unit';
