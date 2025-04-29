
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

export const createTeamMember = async (member: Omit<TeamMember, 'id'> & { isLead?: boolean }) => {
  try {
    // If the member is a lead, we need to update the department as well
    const result = await apiRequest<TeamMember>('/team-members', 'POST', member);
    
    // If the member is marked as a lead, update the department with this member as lead
    if (member.isLead && member.department) {
      try {
        // Get all departments
        const departments = await apiRequest<any[]>('/departments');
        // Find the department
        const department = departments.find(d => d.name === member.department);
        
        if (department) {
          // Update the department with the new lead
          await apiRequest(`/departments/${department.id}`, 'PUT', {
            leadId: result.id
          });
        }
      } catch (error) {
        console.error('Error updating department lead:', error);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error creating team member:', error);
    throw error;
  }
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
