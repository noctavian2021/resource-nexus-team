
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

// Define user roles
export type UserRole = 'Director' | 'Department Lead' | 'Team Member';

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

export const createTeamMember = async (member: Omit<TeamMember, 'id'> & { isLead?: boolean; isDirector?: boolean }) => {
  try {
    // If the member is a lead or director, we need to handle special cases
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
    
    // If member is a director, we don't need special handling for now
    // Just storing the role in the member object is sufficient
    
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

// New function to get organizational structure
export const getOrgStructure = async () => {
  try {
    const members = await getTeamMembers();
    const departments = await apiRequest<any[]>('/departments');
    
    // Get directors
    const directors = members.filter(m => m.role === 'Director');
    
    // Group members by department
    const departmentMembers = departments.map(dept => {
      const lead = members.find(m => m.id === dept.leadId);
      const teamMembers = members.filter(
        m => m.department === dept.name && m.id !== dept.leadId
      );
      
      return {
        department: dept,
        lead,
        members: teamMembers
      };
    });
    
    return {
      directors,
      departments: departmentMembers
    };
  } catch (error) {
    console.error('Error getting organization structure:', error);
    throw error;
  }
};
