
/**
 * Core API client for the Resource Nexus app
 */

// Configuration
export const API_URL = 'http://localhost:5000'; 
export const USE_MOCK = false;

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
  
  const url = `${API_URL}${endpoint}`;
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
      const errorData = await response.json();
      throw new Error(errorData.error || 'An error occurred');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export default apiRequest;
