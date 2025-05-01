
import { Project } from '@/data/mockData';
import apiRequest from './api';

// Cache invalidation for projects
let projectsLastFetched = 0;
let projectsCache: Project[] | null = null;
const CACHE_TTL = 30000; // 30 seconds cache TTL

export const getProjects = async () => {
  const now = Date.now();
  
  // If cache is valid, return it
  if (projectsCache && now - projectsLastFetched < CACHE_TTL) {
    return projectsCache;
  }
  
  // Fetch fresh data
  try {
    const projects = await apiRequest<Project[]>('/projects');
    projectsCache = projects;
    projectsLastFetched = now;
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const getProject = async (id: string) => {
  try {
    return await apiRequest<Project>(`/projects/${id}`);
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw error;
  }
};

// The addProject function now uses createProject directly and invalidates cache
export const addProject = async (project: Omit<Project, 'id'>) => {
  const result = await createProject(project);
  // Invalidate cache to ensure fresh data on next fetch
  projectsCache = null;
  return result;
};

export const createProject = (project: Omit<Project, 'id'>) => {
  return apiRequest<Project>('/projects', 'POST', project);
};

export const updateProject = (id: string, updates: Partial<Project>) => {
  // Invalidate cache to ensure fresh data on next fetch
  projectsCache = null;
  return apiRequest<Project>(`/projects/${id}`, 'PUT', updates);
};

export const hideProject = (id: string, isHidden: boolean) => {
  // We'll update the project with an isHidden property
  projectsCache = null;
  return updateProject(id, { isHidden });
};

export const deleteProject = (id: string) => {
  // Invalidate cache to ensure fresh data on next fetch
  projectsCache = null;
  return apiRequest(`/projects/${id}`, 'DELETE');
};
