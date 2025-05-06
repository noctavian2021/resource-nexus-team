
import { Department } from '@/data/mockData';
import apiRequest, { isMockDataEnabled } from './api';
import { mockDepartments } from '@/data/mockData';

export const getDepartments = () => {
  return apiRequest<Department[]>('/departments');
};

export const getDepartment = (id: string) => {
  return apiRequest<Department>(`/departments/${id}`);
};

// Fixed to handle mock data creation properly
export const createDepartment = async (department: Omit<Department, 'id'>) => {
  try {
    // Try the normal API request first
    return await apiRequest<Department>('/departments', 'POST', department);
  } catch (error) {
    console.error('API request failed, falling back to mock data', error);
    
    // If we're in mock mode and the API request failed, create a mock department
    if (isMockDataEnabled()) {
      console.log('[MOCK] POST /departments');
      
      // Generate a mock response with an ID
      const newDepartment: Department = {
        ...department,
        id: `mock-${Date.now()}`, // Generate a unique mock ID
        isHidden: false, // Default to visible
      };
      
      // For testing purposes - log the created department
      console.log('Created mock department:', newDepartment);
      
      // Return the mock department
      return Promise.resolve(newDepartment);
    }
    
    // Re-throw the error if we're not in mock mode
    throw error;
  }
};

export const updateDepartment = (id: string, updates: Partial<Department>) => {
  return apiRequest<Department>(`/departments/${id}`, 'PUT', updates);
};

export const hideDepartment = (id: string, isHidden: boolean) => {
  // We'll update the department with an isHidden property
  return updateDepartment(id, { isHidden });
};

export const deleteDepartment = (id: string) => {
  return apiRequest(`/departments/${id}`, 'DELETE');
};
