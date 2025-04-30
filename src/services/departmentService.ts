
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
  // We don't need to explicitly set leadId to empty string here
  // as the server will handle undefined/null leadId values
  return apiRequest<Department>('/departments', 'POST', department);
};

export const updateDepartment = (id: string, updates: Partial<Department>) => {
  return apiRequest<Department>(`/departments/${id}`, 'PUT', updates);
};

export const deleteDepartment = (id: string) => {
  return apiRequest(`/departments/${id}`, 'DELETE');
};
