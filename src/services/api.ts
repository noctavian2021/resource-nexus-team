
/**
 * API service for the Resource Nexus app
 * This file re-exports from the new modular API files
 * to maintain backwards compatibility
 */

// Re-export the main API client
import apiRequest, { API_URL, USE_MOCK } from './apiClient';

// Export for backward compatibility
export { API_URL, USE_MOCK };
export default apiRequest;
