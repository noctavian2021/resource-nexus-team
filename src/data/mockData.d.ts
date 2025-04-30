
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
    requestingDepartmentId: string;
    targetDepartmentId: string;
    title: string;
    description: string;
    requiredSkills: string[];
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
    departmentId?: string;
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
}
