
/**
 * Core API client for the Resource Nexus app
 */

import { apiRateLimiter } from '@/utils/security';

// Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; 
let USE_MOCK = import.meta.env.MODE === 'development' ? true : false; // Setting default to true for development mode

// Logger utility
const logger = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[API] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[API ERROR] ${message}`, ...args);
    } else {
      // In production, you might want to log to an error tracking service
    }
  }
};

// Function to toggle mock data
export const toggleMockData = (showMock: boolean) => {
  USE_MOCK = showMock;
  // Save preference to localStorage for persistence
  localStorage.setItem('useMockData', showMock.toString());
  return USE_MOCK;
};

// Initialize from localStorage if available
const initializeMockSetting = () => {
  const savedSetting = localStorage.getItem('useMockData');
  if (savedSetting !== null) {
    USE_MOCK = savedSetting === 'true';
  }
};

// Initialize on load
initializeMockSetting();

// Get current mock data setting
export const isMockDataEnabled = () => USE_MOCK;

// Generic API request function
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data: any = null
): Promise<T> => {
  // Apply rate limiting to prevent API abuse
  if (!apiRateLimiter.check('api')) {
    throw new Error('API rate limit exceeded. Please try again later.');
  }

  // Always use mock data in the Lovable preview environment
  if (window.location.hostname.includes('lovableproject.com') || USE_MOCK) {
    // Import the mock handler on demand to avoid circular dependencies
    const { handleMockRequest } = await import('./mockApiHandler');
    logger.log(`Using mock data for: ${endpoint}`);
    return handleMockRequest<T>(endpoint, method, data);
  }
  
  // Fix for endpoints: ensure they start with a slash if endpoint doesn't already
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}/api${formattedEndpoint}`;
  logger.log(`Making API request to: ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Include cookies for auth
    body: data ? JSON.stringify(data) : null
  };

  // Add CSRF protection if available
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    options.headers = {
      ...options.headers,
      'X-CSRF-Token': csrfToken,
    };
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || 'An error occurred';
      } catch (e) {
        // If not JSON, use the text directly
        errorMessage = errorText || `HTTP error ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle empty responses properly
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      // Only try to parse if there's actual content
      return text ? JSON.parse(text) : {} as T;
    } else {
      // For non-JSON responses, return an empty object
      return {} as T;
    }
  } catch (error) {
    logger.error(`API Error (${endpoint}):`, error);
    
    // If we reach a network error (like in the preview environment),
    // Fall back to mock data
    logger.log(`Falling back to mock data for: ${endpoint}`);
    const { handleMockRequest } = await import('./mockApiHandler');
    return handleMockRequest<T>(endpoint, method, data);
  }
};

// Export the API_URL and apiRequest
export default apiRequest;
