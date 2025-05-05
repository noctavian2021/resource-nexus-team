
// This is a browser shim for postcss-value-parser module
import postcssValueParser from 'postcss-value-parser';

// Export the main module as default
export default postcssValueParser;

// Re-export all named exports from the main module
export * from 'postcss-value-parser';

// Instead of directly importing from internal paths, access via the main import
export const parse = postcssValueParser.parse;
export const unit = postcssValueParser.unit;
