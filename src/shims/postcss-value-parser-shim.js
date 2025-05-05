
// This is a browser shim for postcss-value-parser module
import postcssValueParser from 'postcss-value-parser';

// Export the main module as default
export default postcssValueParser;

// Re-export all named exports from the main module
export * from 'postcss-value-parser';

// Export parse and unit as both methods and properties
// This ensures they work regardless of how they're imported
export const parse = postcssValueParser.parse;
export const unit = postcssValueParser.unit;

// Also make them available as module.exports for CommonJS style imports
export function Parse() {
  return postcssValueParser.parse.apply(this, arguments);
}

export function Unit() {
  return postcssValueParser.unit.apply(this, arguments);
}

// Make sure they're accessible as properties on the default export too
postcssValueParser.Parse = Parse;
postcssValueParser.Unit = Unit;
