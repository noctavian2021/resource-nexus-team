
// This is a browser shim for the queue module
// Simple implementation of a queue with basic functionality

class Queue {
  constructor() {
    this.items = [];
    this.callbacks = [];
    this.processing = false;
  }

  push(item) {
    this.items.push(item);
    this.process();
    return this;
  }

  shift() {
    return this.items.shift();
  }

  process() {
    if (this.processing || this.items.length === 0 || this.callbacks.length === 0) return;
    this.processing = true;
    
    try {
      const item = this.shift();
      const callback = this.callbacks.shift();
      
      if (callback) {
        callback(item);
      }
    } finally {
      this.processing = false;
      
      // Continue processing if there are more items and callbacks
      if (this.items.length > 0 && this.callbacks.length > 0) {
        setTimeout(() => this.process(), 0);
      }
    }
  }

  forEach(callback) {
    this.items.forEach(callback);
    return this;
  }

  get length() {
    return this.items.length;
  }

  get started() {
    return this.processing;
  }

  get end() {
    return this.items.length === 0;
  }
}

// Create the queue factory function
const createQueue = () => new Queue();

// Add all expected exports
createQueue.Queue = Queue;

// Export as both default and named exports
export default createQueue;
export { createQueue, Queue };
