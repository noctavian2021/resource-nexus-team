
/**
 * Core API client for the Resource Nexus app
 */

// Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; 
let USE_MOCK = import.meta.env.MODE === 'development' ? false : false; // Setting default to false for production mode

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
  // If mock mode is enabled, use mock data
  if (USE_MOCK) {
    // Import the mock handler on demand to avoid circular dependencies
    const { handleMockRequest } = await import('./mockApiHandler');
    return handleMockRequest<T>(endpoint, method, data);
  }
  
  // Fix for endpoints: ensure they start with a slash if endpoint doesn't already
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}/api${formattedEndpoint}`;
  console.log(`Making API request to: ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : null
  };

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
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export default apiRequest;
