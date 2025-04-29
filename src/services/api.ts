
/**
 * API service for the Resource Nexus app
 */

// Import the mock data directly
import { teamMembers as initialTeamMembers } from '@/data/mockData';

const API_URL = 'http://localhost:5000/api';
const USE_MOCK = true; // Enable mock mode since local API server isn't available

// Generic API request function
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data: any = null
): Promise<T> => {
  // If mock mode is enabled, use mock data
  if (USE_MOCK) {
    return handleMockRequest<T>(endpoint, method, data);
  }
  
  const url = `${API_URL}${endpoint}`;
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

// Mock implementation to handle requests when server is not available
const handleMockRequest = <T>(endpoint: string, method: string, data: any): Promise<T> => {
  console.log(`Mock API request: ${method} ${endpoint}`);
  
  // Get mock team members data from localStorage or initialize with default data
  let mockTeamMembers = JSON.parse(localStorage.getItem('mockTeamMembers') || 'null');
  
  // Initialize with default data if empty
  if (!mockTeamMembers) {
    mockTeamMembers = initialTeamMembers;
    localStorage.setItem('mockTeamMembers', JSON.stringify(mockTeamMembers));
  }
  
  // Handle different endpoints
  if (endpoint === '/team-members') {
    if (method === 'GET') {
      return Promise.resolve(mockTeamMembers as T);
    } else if (method === 'POST') {
      const newMember = {
        id: `mock-${Date.now()}`,
        ...data
      };
      mockTeamMembers.push(newMember);
      localStorage.setItem('mockTeamMembers', JSON.stringify(mockTeamMembers));
      console.log('Created new team member:', newMember);
      return Promise.resolve(newMember as T);
    }
  } else if (endpoint.startsWith('/team-members/')) {
    const id = endpoint.split('/').pop();
    if (method === 'GET') {
      const member = mockTeamMembers.find((m: any) => m.id === id);
      if (!member) {
        return Promise.reject(new Error('Team member not found'));
      }
      return Promise.resolve(member as T);
    } else if (method === 'PUT') {
      mockTeamMembers = mockTeamMembers.map((m: any) => 
        m.id === id ? { ...m, ...data } : m
      );
      localStorage.setItem('mockTeamMembers', JSON.stringify(mockTeamMembers));
      const updatedMember = mockTeamMembers.find((m: any) => m.id === id);
      return Promise.resolve(updatedMember as T);
    } else if (method === 'DELETE') {
      const deletedMember = mockTeamMembers.find((m: any) => m.id === id);
      mockTeamMembers = mockTeamMembers.filter((m: any) => m.id !== id);
      localStorage.setItem('mockTeamMembers', JSON.stringify(mockTeamMembers));
      return Promise.resolve({ message: 'Team member deleted', member: deletedMember } as T);
    }
  } else if (endpoint === '/email/send-welcome') {
    // Mock email sending
    console.log('Sending welcome email to:', data.email);
    return Promise.resolve({ success: true, message: 'Welcome email sent successfully' } as T);
  }
  
  // Default case
  return Promise.resolve({} as T);
};

export default apiRequest;
