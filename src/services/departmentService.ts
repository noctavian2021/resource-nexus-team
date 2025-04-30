
import { Department } from '@/data/mockData';
import apiRequest from './api';

export const getDepartments = () => {
  return apiRequest<Department[]>('/departments');
};

export const getDepartment = (id: string) => {
  return apiRequest<Department>(`/departments/${id}`);
};

// Updated to accept optional leadId
export const createDepartment = (department: Omit<Department, 'id'>) => {
  // Ensure department has a leadId property (can be empty string)
  const departmentData = {
    ...department,
    leadId: department.leadId || ''
  };
  
  return apiRequest<Department>('/departments', 'POST', departmentData);
};

export const updateDepartment = (id: string, updates: Partial<Department>) => {
  return apiRequest<Department>(`/departments/${id}`, 'PUT', updates);
};

export const deleteDepartment = (id: string) => {
  return apiRequest(`/departments/${id}`, 'DELETE');
};
