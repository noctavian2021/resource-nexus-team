
// This is a browser shim for cross-fetch module
import * as crossFetchModule from 'cross-fetch';

// Re-export as both default and named export for compatibility
export default crossFetchModule;

// Re-export any specific named exports for compatibility
export const fetch = crossFetchModule.fetch;
export const Headers = crossFetchModule.Headers;
export const Request = crossFetchModule.Request;
export const Response = crossFetchModule.Response;
