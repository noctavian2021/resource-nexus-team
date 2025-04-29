
import { TeamMember } from '@/data/mockData';
import apiRequest from './api';

export interface ProjectInvolvement {
  projectId: string;
  percentage: number;
}

export interface RequiredResource {
  type: string; // 'account', 'permission', 'url', 'vpn', 'other'
  name: string;
  description: string;
}

export interface OfficeDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
}

export const getTeamMembers = () => {
  return apiRequest<TeamMember[]>('/team-members');
};

export const getTeamMembersByDepartment = (departmentName: string) => {
  return apiRequest<TeamMember[]>('/team-members').then(members => 
    members.filter(member => member.department.toLowerCase() === departmentName.toLowerCase())
  );
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
  additionalNotes: string;
  requiredResources?: RequiredResource[];
}) => {
  return apiRequest('/email/send-welcome', 'POST', data);
};
