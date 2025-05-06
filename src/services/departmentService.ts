
import { Department } from '@/data/mockData';
import apiRequest from './api';
import { toast } from '@/hooks/use-toast';

export const getDepartments = () => {
  return apiRequest<Department[]>('/departments');
};

export const getDepartment = (id: string) => {
  return apiRequest<Department>(`/departments/${id}`);
};

// Make leadId properly optional
export const createDepartment = (department: Omit<Department, 'id'>) => {
  try {
    console.log('Creating department:', department);
    
    // Generate a mock response when in mock mode
    // This will bypass the missing endpoint in mockApiHandler
    if (window && (window as any).isMockDataEnabled && (window as any).isMockDataEnabled()) {
      console.log('Using mock data workaround for department creation');
      // Create a mock department with an ID (no createdAt or updatedAt)
      const mockDepartment: Department = {
        id: `mock-${Date.now()}`,
        ...department
      };
      
      // Show success toast
      toast({
        title: "Department created",
        description: `${department.name} department has been created successfully.`
      });
      
      return Promise.resolve(mockDepartment);
    }
    
    // Otherwise proceed with the real API request
    return apiRequest<Department>('/departments', 'POST', department);
  } catch (error) {
    console.error('Error creating department:', error);
    // Show error toast
    toast({
      title: "Error creating department",
      description: "Failed to create department. Please try again.",
      variant: "destructive"
    });
    throw error; // Re-throw so it can be handled by the component
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
