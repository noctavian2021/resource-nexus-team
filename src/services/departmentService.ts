
import { Department } from '@/data/mockData';
import apiRequest from './api';

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
    // We don't need to explicitly set leadId to empty string here
    // as the server will handle undefined/null leadId values
    return apiRequest<Department>('/departments', 'POST', department);
  } catch (error) {
    console.error('Error creating department:', error);
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
