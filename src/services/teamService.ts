
import { TeamMember } from '@/data/mockData';
import apiRequest from './api';

export const getTeamMembers = () => {
  return apiRequest<TeamMember[]>('/team-members');
};

export const getTeamMember = (id: string) => {
  return apiRequest<TeamMember>(`/team-members/${id}`);
};

export const createTeamMember = (member: Omit<TeamMember, 'id'>) => {
  return apiRequest<TeamMember>('/team-members', 'POST', member);
};

export const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
  return apiRequest<TeamMember>(`/team-members/${id}`, 'PUT', updates);
};

export const deleteTeamMember = (id: string) => {
  return apiRequest(`/team-members/${id}`, 'DELETE');
};

export const sendWelcomePackage = (data: { 
  email: string; 
  replacingMember: string; 
  additionalNotes: string 
}) => {
  return apiRequest('/email/send-welcome', 'POST', data);
};
