import { useNotifications } from "@/hooks/useNotifications";

// Team Member
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatar?: string;
  skills: string[];
  availability: number; // percentage available
  projects: string[];
  vacation?: {
    isOnVacation: boolean;
    startDate: string;
    endDate: string;
  };
}

// Project
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  startDate: string;
  endDate: string;
  progress: number;
  priority: 'Low' | 'Medium' | 'High';
  teamMembers: string[];
  departmentId: string;
}

// Department
export interface Department {
  id: string;
  name: string;
  description: string;
  leadId: string;
  memberCount: number;
  color: string;
}

// Activity
export interface Activity {
  id: string;
  userId: string;
  type: 'assignment' | 'project_update' | 'department_change' | 'resource_request' | 'absence_start' | 'absence_end';
  description: string;
  timestamp: string;
  relatedId?: string;
}

// Resource Request
export interface ResourceRequest {
  id: string;
  requesterId: string;
  projectId: string;
  departmentId: string;
  roleNeeded: string;
  skillsRequired: string[];
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  priority: 'Low' | 'Medium' | 'High';
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for our application
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

export const recentActivities: Activity[] = [
  {
    id: '1',
    userId: '1',
    type: 'assignment',
    description: 'Alex Johnson was assigned to Website Redesign project',
    timestamp: '2025-04-25T10:30:00Z',
    relatedId: '1'
  },
  {
    id: '2',
    userId: '2',
    type: 'project_update',
    description: 'Sarah Miller updated Mobile App Development status to Active',
    timestamp: '2025-04-24T15:45:00Z',
    relatedId: '2'
  },
  {
    id: '3',
    userId: '3',
    type: 'department_change',
    description: 'Michael Chen moved from Product to Engineering department',
    timestamp: '2025-04-23T09:15:00Z'
  },
  {
    id: '4',
    userId: '4',
    type: 'resource_request',
    description: 'Emily Davis requested additional resources for Q2 Marketing Campaign',
    timestamp: '2025-04-22T14:20:00Z',
    relatedId: '3'
  },
  {
    id: '5',
    userId: '1',
    type: 'absence_start',
    description: 'Alex Johnson started vacation (until May 15)',
    timestamp: '2025-05-01T00:00:00Z'
  },
  {
    id: '6',
    userId: '1',
    type: 'absence_end',
    description: 'Alex Johnson returned from vacation',
    timestamp: '2025-05-15T00:00:00Z'
  }
];

export const resourceRequests: ResourceRequest[] = [];

// Helper functions to get data by ID
export const getTeamMemberById = (id: string): TeamMember | undefined => {
  return teamMembers.find(member => member.id === id);
};

export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

export const getDepartmentById = (id: string): Department | undefined => {
  return departments.find(dept => dept.id === id);
};

export const getResourceRequestById = (id: string): ResourceRequest | undefined => {
  return resourceRequests.find(req => req.id === id);
};
