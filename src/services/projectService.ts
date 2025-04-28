
import { Project } from '@/data/mockData';
import apiRequest from './api';

export const getProjects = () => {
  return apiRequest<Project[]>('/projects');
};

export const getProject = (id: string) => {
  return apiRequest<Project>(`/projects/${id}`);
};

export const createProject = (project: Omit<Project, 'id'>) => {
  return apiRequest<Project>('/projects', 'POST', project);
};

export const updateProject = (id: string, updates: Partial<Project>) => {
  return apiRequest<Project>(`/projects/${id}`, 'PUT', updates);
};

export const deleteProject = (id: string) => {
  return apiRequest(`/projects/${id}`, 'DELETE');
};
