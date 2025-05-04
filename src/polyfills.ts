
// Add necessary polyfills for browser environment
import { Buffer as BufferPolyfill } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || BufferPolyfill;
}
