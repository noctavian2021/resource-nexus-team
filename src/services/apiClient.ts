import { handleMockRequest } from './mockApiHandler';

// Use import.meta.env instead of process.env for Vite
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';

// Flag to control mock data usage
let useMockData = true; // Changed to true by default for development

// Toggle mock data usage
export const toggleMockData = (enabled: boolean): boolean => {
  useMockData = enabled;
  console.log(`Mock data is now ${useMockData ? 'enabled' : 'disabled'}`);
  
  // Expose to window for components to check
  if (typeof window !== 'undefined') {
    (window as any).isMockDataEnabled = isMockDataEnabled;
  }
  
  return useMockData; // Return the new state
};

// Check if mock data is enabled
export const isMockDataEnabled = () => useMockData;

// Expose to window for components to check
if (typeof window !== 'undefined') {
  (window as any).isMockDataEnabled = isMockDataEnabled;
}

/**
 * Generic API request function
 * Will use mock data if enabled, otherwise will make real API requests
 */
const apiRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  options: RequestInit = {}
): Promise<T> => {
  // Log the request
  console.log(`API Request: ${method} ${endpoint}`);

  // Use mock data if enabled
  if (useMockData) {
    try {
      console.log(`Using mock data for ${method} ${endpoint}`);
      return await handleMockRequest<T>(endpoint, method, data);
    } catch (error) {
      console.error('Mock API error:', error);
      throw error;
    }
  }

  // Otherwise make a real API request
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(data);
    }

    // Determine the appropriate URL based on the endpoint
    let url: string;
    if (endpoint.startsWith('/api/') || endpoint.includes('/email/')) {
      // Use the /api prefix for any API or email routes
      // Make sure paths that start with /email/ get the /api prefix
      if (endpoint.startsWith('/email/')) {
        url = `/api${endpoint}`;
      } else {
        url = endpoint; // Already has /api prefix
      }
      console.log(`Using API endpoint: ${url}`);
    } else {
      // Use the configured API_URL for other endpoints
      url = `${API_URL}${endpoint}`;
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      
      // Try to get more detailed error information
      let errorDetail = response.statusText;
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            // Try to parse as JSON
            const errorJson = JSON.parse(errorText);
            errorDetail = errorJson.error || errorJson.message || errorText;
          } catch {
            // If not JSON, use text directly
            errorDetail = errorText;
          }
        }
      } catch (err) {
        // If we can't read the error, use status text
        console.error("Couldn't read error details:", err);
      }
      
      throw new Error(`API error: ${response.status} ${errorDetail}`);
    }

    // For DELETE requests with no content
    if (response.status === 204) {
      return {} as T;
    }

    // Check if the response has content before trying to parse as JSON
    const text = await response.text();
    if (!text) {
      console.log('Empty response received');
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch (err) {
      console.error('Failed to parse response as JSON:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error('API request error:', error);
    
    // Fallback to mock data when API fails
    if (!useMockData) {
      console.log('API request failed, falling back to mock data');
      try {
        return await handleMockRequest<T>(endpoint, method, data);
      } catch (mockError) {
        console.error('Mock fallback error:', mockError);
        throw error; // Throw the original error if mock fails too
      }
    }
    
    throw error;
  }
};

export default apiRequest;
