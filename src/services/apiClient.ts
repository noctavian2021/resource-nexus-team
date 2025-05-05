
import { handleMockRequest } from './mockApiHandler';

export const API_URL = 'https://api.example.com';

// Flag to control mock data usage
let useMockData = true;

// Toggle mock data usage
export const toggleMockData = (enabled: boolean): boolean => {
  useMockData = enabled;
  console.log(`Mock data is now ${useMockData ? 'enabled' : 'disabled'}`);
  return useMockData; // Return the new state
};

// Check if mock data is enabled
export const isMockDataEnabled = () => useMockData;

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

    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // For DELETE requests with no content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export default apiRequest;
