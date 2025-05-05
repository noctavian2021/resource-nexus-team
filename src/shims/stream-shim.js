
// This is a browser shim for Node.js stream module

// Re-export stream-browserify functionality
import streamBrowserify from 'stream-browserify';

export default streamBrowserify;

// Also export individual components of stream for selective imports
export const {
  Readable,
  Writable,
  Duplex,
  Transform,
  PassThrough,
  pipeline,
  finished,
} = streamBrowserify;

// Add any custom implementations if needed for specific use cases
