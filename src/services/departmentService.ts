
import { Department } from '@/data/mockData';
import apiRequest from './api';

export const getDepartments = () => {
  return apiRequest<Department[]>('/departments');
};

export const getDepartment = (id: string) => {
  return apiRequest<Department>(`/departments/${id}`);
};

export const createDepartment = (department: Omit<Department, 'id'>) => {
  return apiRequest<Department>('/departments', 'POST', department);
};

export const updateDepartment = (id: string, updates: Partial<Department>) => {
  return apiRequest<Department>(`/departments/${id}`, 'PUT', updates);
};

export const deleteDepartment = (id: string) => {
  return apiRequest(`/departments/${id}`, 'DELETE');
};
