// Mock data for the Resource Nexus Team app
import { ProjectInvolvement, RequiredResource, OfficeDays } from '../services/teamService';

// Team members
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatar: string;
  skills: string[];
  availability: number; // Percentage available
  projects: string[];
  projectInvolvements?: ProjectInvolvement[];
  requiredResources?: RequiredResource[];
  officeDays?: OfficeDays;
  vacation?: {
    isOnVacation: boolean;
    startDate?: string;
    endDate?: string;
  };
}

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Senior Developer',
    department: 'Engineering',
    email: 'alex@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    skills: ['React', 'TypeScript', 'Node.js'],
    availability: 25,
    projects: ['1', '3'],
    vacation: {
      isOnVacation: true,
      startDate: '2025-05-01',
      endDate: '2025-05-15'
    }
  },
  {
    id: '2',
    name: 'Sarah Miller',
    role: 'UX Designer',
    department: 'Design',
    email: 'sarah@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    skills: ['UI Design', 'User Research', 'Prototyping'],
    availability: 50,
    projects: ['2']
  },
  {
    id: '3',
    name: 'Michael Chen',
    role: 'Project Manager',
    department: 'Product',
    email: 'michael@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    skills: ['Agile', 'Roadmapping', 'Stakeholder Management'],
    availability: 15,
    projects: ['1', '2', '4'],
    vacation: {
      isOnVacation: false,
      startDate: '2025-06-10',
      endDate: '2025-06-24'
    }
  },
  {
    id: '4',
    name: 'Emily Davis',
    role: 'Marketing Specialist',
    department: 'Marketing',
    email: 'emily@example.com',
    avatar: 'https://i.pravatar.cc/150?img=9',
    skills: ['Content Strategy', 'SEO', 'Social Media'],
    availability: 75,
    projects: ['3']
  },
  {
    id: '5',
    name: 'James Wilson',
    role: 'DevOps Engineer',
    department: 'Engineering',
    email: 'james@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    skills: ['Docker', 'Kubernetes', 'CI/CD'],
    availability: 30,
    projects: ['4']
  }
];

// Departments
export interface Department {
  id: string;
  name: string;
  description: string;
  leadId: string;
  memberCount: number;
  color: string;
}

export const departments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software development and technical operations',
    leadId: '1',
    memberCount: 12,
    color: '#3b82f6', // blue-500
  },
  {
    id: '2',
    name: 'Design',
    description: 'User experience and interface design',
    leadId: '2',
    memberCount: 8,
    color: '#8b5cf6', // violet-500
  },
  {
    id: '3',
    name: 'Product',
    description: 'Product management and strategy',
    leadId: '3',
    memberCount: 6,
    color: '#10b981', // emerald-500
  },
  {
    id: '4',
    name: 'Marketing',
    description: 'Brand and growth marketing',
    leadId: '4',
    memberCount: 7,
    color: '#f59e0b', // amber-500
  },
  {
    id: '5',
    name: 'Sales',
    description: 'Customer acquisition and account management',
    leadId: '5',
    memberCount: 10,
    color: '#ef4444', // red-500
  }
];

// Projects
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Planning' | 'On Hold' | 'Completed';
  startDate: string;
  endDate: string;
  progress: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  teamMembers: string[];
  departmentId: string;
}

export const projects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Overhaul of the company website with new branding and improved UX',
    status: 'Active',
    startDate: '2025-01-15',
    endDate: '2025-04-30',
    progress: 35,
    priority: 'High',
    teamMembers: ['1', '3'],
    departmentId: '2'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Creating a native mobile app for our core product',
    status: 'Active',
    startDate: '2025-02-10',
    endDate: '2025-07-25',
    progress: 20,
    priority: 'Medium',
    teamMembers: ['2', '3'],
    departmentId: '1'
  },
  {
    id: '3',
    name: 'Q2 Marketing Campaign',
    description: 'Planning and execution of Q2 marketing initiatives',
    status: 'Planning',
    startDate: '2025-03-01',
    endDate: '2025-06-30',
    progress: 10,
    priority: 'Medium',
    teamMembers: ['1', '4'],
    departmentId: '4'
  },
  {
    id: '4',
    name: 'Infrastructure Upgrade',
    description: 'Modernizing our cloud infrastructure for better scalability',
    status: 'On Hold',
    startDate: '2025-01-05',
    endDate: '2025-05-15',
    progress: 5,
    priority: 'Low',
    teamMembers: ['3', '5'],
    departmentId: '1'
  },
  {
    id: '5',
    name: 'Product Analytics Implementation',
    description: 'Setting up comprehensive analytics for our product suite',
    status: 'Planning',
    startDate: '2025-04-01',
    endDate: '2025-06-15',
    progress: 0,
    priority: 'High',
    teamMembers: [],
    departmentId: '3'
  }
];

// Recent Activities
export interface Activity {
  id: string;
  type: 'assignment' | 'project_update' | 'resource_request' | 'department_change';
  description: string;
  timestamp: string;
  userId: string;
}

export const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'assignment',
    description: 'Alex Johnson was assigned to Website Redesign project',
    timestamp: '2025-03-28T10:23:45',
    userId: '1'
  },
  {
    id: '2',
    type: 'project_update',
    description: 'Mobile App Development status changed to Active',
    timestamp: '2025-03-27T16:42:10',
    userId: '3'
  },
  {
    id: '3',
    type: 'resource_request',
    description: 'New resource request created for Product Analytics Implementation',
    timestamp: '2025-03-27T09:15:32',
    userId: '3'
  },
  {
    id: '4',
    type: 'assignment',
    description: 'Emily Davis was assigned to Q2 Marketing Campaign',
    timestamp: '2025-03-26T13:50:21',
    userId: '4'
  },
  {
    id: '5',
    type: 'department_change',
    description: 'James Wilson moved from DevOps to Engineering department',
    timestamp: '2025-03-25T11:33:07',
    userId: '5'
  }
];

// Dashboard metrics
export interface Metrics {
  teamMemberCount: number;
  activeProjects: number;
  totalDepartments: number;
  resourceUtilization: number;
  pendingRequests: number;
  upcomingDeadlines: number;
}

export const dashboardMetrics: Metrics = {
  teamMemberCount: 32,
  activeProjects: 8,
  totalDepartments: 5,
  resourceUtilization: 78, // percentage
  pendingRequests: 4,
  upcomingDeadlines: 3
};

// Resource allocation data for charts
export interface AllocationData {
  department: string;
  allocated: number;
  available: number;
}

export const allocationData: AllocationData[] = [
  { department: 'Engineering', allocated: 75, available: 25 },
  { department: 'Design', allocated: 65, available: 35 },
  { department: 'Product', allocated: 90, available: 10 },
  { department: 'Marketing', allocated: 40, available: 60 },
  { department: 'Sales', allocated: 60, available: 40 }
];

// Resource Request Status type
export type RequestStatus = 'Pending' | 'Approved' | 'Declined';

// Resource Request interface
export interface ResourceRequest {
  id: string;
  title: string;
  description: string;
  requestingDepartmentId: string;
  targetDepartmentId: string;
  requesterId: string;
  requiredSkills: string[];
  startDate: string;
  endDate: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string | null;
  projectId: string | null;
}

// Mock resource requests data
export const resourceRequests: ResourceRequest[] = [
  {
    id: '1',
    title: 'Frontend Developer Needed',
    description: 'Need a frontend developer for the Website Redesign project',
    requestingDepartmentId: '4', // Marketing
    targetDepartmentId: '1', // Engineering
    requesterId: '4', // Emily Davis
    requiredSkills: ['React', 'TypeScript'],
    startDate: '2025-05-01',
    endDate: '2025-06-30',
    status: 'Pending',
    createdAt: '2025-04-15T09:00:00',
    updatedAt: null,
    projectId: '1'
  },
  {
    id: '2',
    title: 'UX Designer for Mobile App',
    description: 'Requesting UX designer support for our mobile app development',
    requestingDepartmentId: '1', // Engineering
    targetDepartmentId: '2', // Design
    requesterId: '1', // Alex Johnson
    requiredSkills: ['UI Design', 'User Research'],
    startDate: '2025-05-15',
    endDate: '2025-07-15',
    status: 'Approved',
    createdAt: '2025-04-10T14:30:00',
    updatedAt: '2025-04-12T11:20:00',
    projectId: '2'
  }
];

// Helper function to get team member by ID
export const getTeamMemberById = (id: string): TeamMember | undefined => {
  return teamMembers.find(member => member.id === id);
};

// Helper function to get department by ID
export const getDepartmentById = (id: string): Department | undefined => {
  return departments.find(dept => dept.id === id);
};

// Helper function to get project by ID
export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};
