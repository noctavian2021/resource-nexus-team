
/**
 * Security utilities for the application
 */

// For CSP (Content Security Policy) implementation
export function applyCspHeaders() {
  // This is a client-side implementation
  // In production, you should set these headers on your server
  
  // Sample implementation - in production this should be server-side
  if (typeof document !== 'undefined' && process.env.NODE_ENV === 'production') {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = 
      "default-src 'self'; " +
      "script-src 'self'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https://i.pravatar.cc; " +
      "font-src 'self'; " +
      "connect-src 'self';";
    document.head.appendChild(meta);
  }
}

// XSS Protection utility
export function sanitizeInput(input: string): string {
  // Basic HTML sanitization
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Rate limiting utility
class RateLimiter {
  private requests: Record<string, Array<number>> = {};
  private limit: number;
  private window: number;

  constructor(limit: number = 100, windowMs: number = 60000) {
    this.limit = limit; // Number of requests
    this.window = windowMs; // Time window in milliseconds
  }

  check(key: string): boolean {
    const now = Date.now();
    
    // Initialize if this is first request for this key
    if (!this.requests[key]) {
      this.requests[key] = [];
    }
    
    // Clean old requests outside the window
    this.requests[key] = this.requests[key].filter(time => now - time < this.window);
    
    // Check if limit is reached
    if (this.requests[key].length >= this.limit) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    this.requests[key].push(now);
    return true; // Request allowed
  }
}

// Export a singleton rate limiter
export const apiRateLimiter = new RateLimiter();

// Session timeout utility
export class SessionManager {
  private timeoutId: number | null = null;
  private timeoutDuration: number;
  private warningCallback: (() => void) | null = null;
  private logoutCallback: (() => void) | null = null;
  private lastActivity: number = Date.now();

  constructor(timeoutMinutes: number = 30) {
    this.timeoutDuration = timeoutMinutes * 60 * 1000;
  }

  startMonitoring(warningCallback: () => void, logoutCallback: () => void) {
    this.warningCallback = warningCallback;
    this.logoutCallback = logoutCallback;
    
    // Set up activity listeners
    window.addEventListener('mousemove', () => this.resetTimer());
    window.addEventListener('keypress', () => this.resetTimer());
    window.addEventListener('touchstart', () => this.resetTimer());
    window.addEventListener('click', () => this.resetTimer());
    
    // Start the initial timer
    this.resetTimer();
  }

  resetTimer() {
    this.lastActivity = Date.now();
    
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    
    // Set warning to trigger 1 minute before timeout
    this.timeoutId = window.setTimeout(() => {
      if (this.warningCallback) {
        this.warningCallback();
      }
      
      // Set final timeout
      window.setTimeout(() => {
        if (this.logoutCallback) {
          this.logoutCallback();
        }
      }, 60000); // 1 minute after warning
    }, this.timeoutDuration - 60000);
  }

  getIdleTime(): number {
    return Math.floor((Date.now() - this.lastActivity) / 1000);
  }
}

// Export a session manager instance
export const sessionManager = new SessionManager();
