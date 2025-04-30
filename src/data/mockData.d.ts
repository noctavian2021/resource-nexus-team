
import { TeamMember, Project } from '@/data/mockData';

export interface AllocationData {
  name: string;
  allocation: number;
  value: number;
}

export interface Metrics {
  title: string;
  value: string | number;
  change: number;
  icon?: React.ReactNode;
}

// Extend TeamMember interface with the new properties
declare module '@/data/mockData' {
  export interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    department: string;
    avatar: string;
    skills?: string[];
    availability?: number;
    projects?: string[];
    status?: 'active' | 'disabled';
    officeDays?: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
    };
    projectInvolvements?: Array<{
      projectId: string;
      percentage: number;
    }>;
    requiredResources?: Array<{
      name: string;
      type: string;
      description?: string;
    }>;
    vacation?: {
      isOnVacation: boolean;
      startDate?: string;
      endDate?: string;
    };
  }

  export interface ResourceRequest {
    id: string;
    requesterId?: string;
    projectId?: string;
    departmentId?: string;
    requestingDepartmentId: string; // Added this
    targetDepartmentId: string; // Added this
    title: string; // Added this
    description: string;
    roleNeeded?: string;
    skillsRequired?: string[];
    requiredSkills: string[]; // Added this
    startDate: string;
    endDate: string;
    status: string;
    priority?: 'Low' | 'Medium' | 'High';
    createdAt: string;
    updatedAt?: string;
  }
  
  // Add types for activity
  export interface Activity {
    id: string;
    userId: string;
    timestamp: string;
    description: string;
    type: "assignment" | "project_update" | "department_change" | "resource_request" | "absence_start" | "absence_end";
    relatedId?: string;
  }

  export const dashboardMetrics: Metrics[];
  export const allocationData: AllocationData[];
  export interface AllocationData {
    name: string;
    allocation: number;
    value: number;
  }
  
  export interface Department {
    id: string;
    name: string;
    description: string;
    color: string;
    leadId: string;
    memberCount: number;
  }
  
  // Update Project interface to include Urgent priority
  export interface Project {
    id: string;
    name: string;
    description: string;
    client: string;
    startDate?: string;
    endDate?: string;
    status: "Active" | "Planning" | "Completed" | "On Hold";
    priority: "Low" | "Medium" | "High" | "Urgent"; // Added "Urgent" here
    teamMembers: string[];
    departmentId: string;
    progress: number;
  }
}
