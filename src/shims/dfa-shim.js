
// This is a browser shim for the dfa module
import * as dfaModule from 'dfa';

// Create a default export that proxies to the actual module
const dfaDefault = dfaModule;

// Re-export as both default and named exports for compatibility
export default dfaDefault;

// Re-export any other named exports if needed
export const DFA = dfaModule.DFA;

