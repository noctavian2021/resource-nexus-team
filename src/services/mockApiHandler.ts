
import { Project, departments, teamMembers } from '@/data/mockData';
import { TeamMember } from '@/data/mockData';

// In-memory storage for mock data
const mockData = {
  teamMembers: [...teamMembers],
  departments: [...departments],
  projects: [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design',
      client: 'Internal',
      startDate: '2023-01-15T00:00:00.000Z',
      endDate: '2023-04-30T00:00:00.000Z',
      status: 'Active',
      priority: 'High',
      progress: 65,
      departmentId: '1',
      teamMembers: ['1', '3', '4'],
      isHidden: false
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Create a new mobile app for customer engagement',
      client: 'TechCorp',
      startDate: '2023-03-01T00:00:00.000Z',
      endDate: '2023-08-31T00:00:00.000Z',
      status: 'Active',
      priority: 'Urgent',
      progress: 30,
      departmentId: '2',
      teamMembers: ['2', '5'],
      isHidden: false
    },
    {
      id: '3',
      name: 'Database Migration',
      description: 'Migrate legacy database to new cloud platform',
      client: 'Internal',
      startDate: '2023-02-15T00:00:00.000Z',
      endDate: '2023-05-15T00:00:00.000Z',
      status: 'On Hold',
      priority: 'Medium',
      progress: 20,
      departmentId: '3',
      teamMembers: ['6', '7'],
      isHidden: false
    },
    {
      id: '4',
      name: 'Annual Report Design',
      description: 'Design and publish the annual company report',
      client: 'Internal',
      startDate: '2023-04-01T00:00:00.000Z',
      endDate: '2023-05-15T00:00:00.000Z',
      status: 'Planning',
      priority: 'Medium',
      progress: 5,
      departmentId: '1',
      teamMembers: ['8', '9'],
      isHidden: false
    }
  ]
};

// Mock data access functions
export const getMockProjects = async (): Promise<Project[]> => {
  // Return a copy of the mock projects to avoid mutation
  return [...mockData.projects];
};

// Get mock team members
export const getMockTeamMembers = async (): Promise<TeamMember[]> => {
  return [...mockData.teamMembers];
};

// Add a new team member to mock data
export const addMockTeamMember = async (member: TeamMember): Promise<TeamMember> => {
  const newMember = { ...member };
  mockData.teamMembers.push(newMember);
  console.log("Team member added to mock data:", newMember);
  console.log("Current team members:", mockData.teamMembers.length);
  return newMember;
};

// Update a team member in mock data
export const updateMockTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  const index = mockData.teamMembers.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Team member not found');
  
  mockData.teamMembers[index] = { ...mockData.teamMembers[index], ...updates };
  return mockData.teamMembers[index];
};

// Handle mock requests
export const handleMockRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data: any = null
): Promise<T> => {
  console.log(`[MOCK] ${method} ${endpoint}`);
  
  // Add delay to simulate network
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Process requests based on endpoint and method
  if (endpoint.startsWith('/projects')) {
    if (endpoint === '/projects' && method === 'GET') {
      return getMockProjects() as unknown as T;
    }
    
    // Handle specific project endpoints
    const match = endpoint.match(/\/projects\/(.+)/);
    if (match) {
      const projectId = match[1];
      if (method === 'GET') {
        const projects = await getMockProjects();
        const project = projects.find(p => p.id === projectId);
        if (!project) throw new Error('Project not found');
        return project as unknown as T;
      } else if (method === 'PUT') {
        // Simulate updating a project
        return { ...data, id: projectId } as unknown as T;
      } else if (method === 'DELETE') {
        // Simulate deleting a project
        return { success: true, message: 'Project deleted' } as unknown as T;
      }
    }
    
    // Handle project creation
    if (endpoint === '/projects' && method === 'POST') {
      const newId = Date.now().toString();
      return { ...data, id: newId } as unknown as T;
    }
  }
  
  // Handle team member requests
  if (endpoint.startsWith('/team-members')) {
    if (endpoint === '/team-members' && method === 'GET') {
      return getMockTeamMembers() as unknown as T;
    }
    
    // Handle team member creation
    if (endpoint === '/team-members' && method === 'POST') {
      const newId = Date.now().toString();
      const newMember = { ...data, id: newId };
      await addMockTeamMember(newMember);
      return newMember as unknown as T;
    }
    
    // Handle specific team member endpoints
    const match = endpoint.match(/\/team-members\/(.+)/);
    if (match) {
      const memberId = match[1];
      if (method === 'GET') {
        const members = await getMockTeamMembers();
        const member = members.find(m => m.id === memberId);
        if (!member) throw new Error('Team member not found');
        return member as unknown as T;
      } else if (method === 'PUT') {
        const updatedMember = await updateMockTeamMember(memberId, data);
        return updatedMember as unknown as T;
      } else if (method === 'DELETE') {
        // Simulate deleting a team member
        const index = mockData.teamMembers.findIndex(m => m.id === memberId);
        if (index !== -1) {
          mockData.teamMembers.splice(index, 1);
        }
        return { success: true, message: 'Team member deleted' } as unknown as T;
      }
    }
  }
  
  // Default response if no handler matches
  throw new Error(`Mock API does not handle ${method} ${endpoint}`);
};
