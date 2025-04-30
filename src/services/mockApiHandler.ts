
/**
 * Mock API handler for the Resource Nexus app 
 * Used when the real API server is not available
 */

import { teamMembers as initialTeamMembers, departments as initialDepartments, projects as initialProjects } from '@/data/mockData';

// Mock implementation to handle requests when server is not available
export const handleMockRequest = <T>(endpoint: string, method: string, data: any): Promise<T> => {
  console.log(`Mock API request: ${method} ${endpoint}`);
  
  // Get mock data from localStorage or initialize with default data
  let mockTeamMembers = JSON.parse(localStorage.getItem('mockTeamMembers') || 'null');
  let mockDepartments = JSON.parse(localStorage.getItem('mockDepartments') || 'null');
  let mockProjects = JSON.parse(localStorage.getItem('mockProjects') || 'null');
  
  // Initialize with default data if empty
  if (!mockTeamMembers) {
    mockTeamMembers = initialTeamMembers;
    localStorage.setItem('mockTeamMembers', JSON.stringify(mockTeamMembers));
  }
  
  if (!mockDepartments) {
    mockDepartments = initialDepartments;
    localStorage.setItem('mockDepartments', JSON.stringify(mockDepartments));
  }
  
  if (!mockProjects) {
    mockProjects = initialProjects;
    localStorage.setItem('mockProjects', JSON.stringify(mockProjects));
  }
  
  // Handle team member endpoints
  if (endpoint === '/team-members') {
    return handleTeamMembersEndpoint<T>(method, data, mockTeamMembers);
  } 
  else if (endpoint.startsWith('/team-members/')) {
    return handleTeamMemberDetailEndpoint<T>(endpoint, method, data, mockTeamMembers);
  } 
  // Handle department endpoints
  else if (endpoint === '/departments') {
    return handleDepartmentsEndpoint<T>(method, data, mockDepartments);
  } 
  else if (endpoint.startsWith('/departments/')) {
    return handleDepartmentDetailEndpoint<T>(endpoint, method, data, mockDepartments);
  } 
  // Handle project endpoints
  else if (endpoint === '/projects') {
    return handleProjectsEndpoint<T>(method, data, mockProjects);
  } 
  else if (endpoint.startsWith('/projects/')) {
    return handleProjectDetailEndpoint<T>(endpoint, method, data, mockProjects);
  } 
  // Handle utility endpoints
  else if (endpoint === '/email/send-welcome') {
    return handleEmailEndpoint<T>(data);
  } 
  else if (endpoint === '/backup/create') {
    return handleBackupCreateEndpoint<T>();
  } 
  else if (endpoint === '/backup/list') {
    return handleBackupListEndpoint<T>();
  } 
  else if (endpoint.startsWith('/backup/restore')) {
    return handleBackupRestoreEndpoint<T>();
  }
  
  // Default case
  return Promise.resolve({} as T);
};

// Team member endpoints handlers
function handleTeamMembersEndpoint<T>(method: string, data: any, mockTeamMembers: any[]): Promise<T> {
  if (method === 'GET') {
    return Promise.resolve(mockTeamMembers as T);
  } else if (method === 'POST') {
    const newMember = {
      id: `mock-${Date.now()}`,
      ...data
    };
    mockTeamMembers.push(newMember);
    localStorage.setItem('mockTeamMembers', JSON.stringify(mockTeamMembers));
    console.log('Created new team member:', newMember);
    return Promise.resolve(newMember as T);
  }
  return Promise.resolve({} as T);
}

function handleTeamMemberDetailEndpoint<T>(endpoint: string, method: string, data: any, mockTeamMembers: any[]): Promise<T> {
  const id = endpoint.split('/').pop();
  if (method === 'GET') {
    const member = mockTeamMembers.find((m: any) => m.id === id);
    if (!member) {
      return Promise.reject(new Error('Team member not found'));
    }
    return Promise.resolve(member as T);
  } else if (method === 'PUT') {
    mockTeamMembers = mockTeamMembers.map((m: any) => 
      m.id === id ? { ...m, ...data } : m
    );
    localStorage.setItem('mockTeamMembers', JSON.stringify(mockTeamMembers));
    const updatedMember = mockTeamMembers.find((m: any) => m.id === id);
    return Promise.resolve(updatedMember as T);
  } else if (method === 'DELETE') {
    const deletedMember = mockTeamMembers.find((m: any) => m.id === id);
    mockTeamMembers = mockTeamMembers.filter((m: any) => m.id !== id);
    localStorage.setItem('mockTeamMembers', JSON.stringify(mockTeamMembers));
    return Promise.resolve({ message: 'Team member deleted', member: deletedMember } as T);
  }
  return Promise.resolve({} as T);
}

// Department endpoints handlers
function handleDepartmentsEndpoint<T>(method: string, data: any, mockDepartments: any[]): Promise<T> {
  if (method === 'GET') {
    return Promise.resolve(mockDepartments as T);
  } else if (method === 'POST') {
    const newDepartment = {
      id: `mock-${Date.now()}`,
      ...data
    };
    mockDepartments.push(newDepartment);
    localStorage.setItem('mockDepartments', JSON.stringify(mockDepartments));
    console.log('Created new department:', newDepartment);
    return Promise.resolve(newDepartment as T);
  }
  return Promise.resolve({} as T);
}

function handleDepartmentDetailEndpoint<T>(endpoint: string, method: string, data: any, mockDepartments: any[]): Promise<T> {
  const id = endpoint.split('/').pop();
  if (method === 'GET') {
    const department = mockDepartments.find((d: any) => d.id === id);
    if (!department) {
      return Promise.reject(new Error('Department not found'));
    }
    return Promise.resolve(department as T);
  } else if (method === 'PUT') {
    mockDepartments = mockDepartments.map((d: any) => 
      d.id === id ? { ...d, ...data } : d
    );
    localStorage.setItem('mockDepartments', JSON.stringify(mockDepartments));
    const updatedDepartment = mockDepartments.find((d: any) => d.id === id);
    return Promise.resolve(updatedDepartment as T);
  } else if (method === 'DELETE') {
    const deletedDepartment = mockDepartments.find((d: any) => d.id === id);
    mockDepartments = mockDepartments.filter((d: any) => d.id !== id);
    localStorage.setItem('mockDepartments', JSON.stringify(mockDepartments));
    return Promise.resolve({ message: 'Department deleted', department: deletedDepartment } as T);
  }
  return Promise.resolve({} as T);
}

// Project endpoints handlers
function handleProjectsEndpoint<T>(method: string, data: any, mockProjects: any[]): Promise<T> {
  if (method === 'GET') {
    return Promise.resolve(mockProjects as T);
  } else if (method === 'POST') {
    const newProject = {
      id: `mock-${Date.now()}`,
      ...data
    };
    mockProjects.push(newProject);
    localStorage.setItem('mockProjects', JSON.stringify(mockProjects));
    console.log('Created new project:', newProject);
    return Promise.resolve(newProject as T);
  }
  return Promise.resolve({} as T);
}

function handleProjectDetailEndpoint<T>(endpoint: string, method: string, data: any, mockProjects: any[]): Promise<T> {
  const id = endpoint.split('/').pop();
  if (method === 'GET') {
    const project = mockProjects.find((p: any) => p.id === id);
    if (!project) {
      return Promise.reject(new Error('Project not found'));
    }
    return Promise.resolve(project as T);
  } else if (method === 'PUT') {
    mockProjects = mockProjects.map((p: any) => 
      p.id === id ? { ...p, ...data } : p
    );
    localStorage.setItem('mockProjects', JSON.stringify(mockProjects));
    const updatedProject = mockProjects.find((p: any) => p.id === id);
    return Promise.resolve(updatedProject as T);
  } else if (method === 'DELETE') {
    const deletedProject = mockProjects.find((p: any) => p.id === id);
    mockProjects = mockProjects.filter((p: any) => p.id !== id);
    localStorage.setItem('mockProjects', JSON.stringify(mockProjects));
    return Promise.resolve({ message: 'Project deleted', project: deletedProject } as T);
  }
  return Promise.resolve({} as T);
}

// Utility endpoint handlers
function handleEmailEndpoint<T>(data: any): Promise<T> {
  console.log('Sending welcome email to:', data.email);
  return Promise.resolve({ success: true, message: 'Welcome email sent successfully' } as T);
}

function handleBackupCreateEndpoint<T>(): Promise<T> {
  const timestamp = new Date();
  const filename = `resource-nexus-backup-${timestamp.toISOString().replace(/:/g, '-')}.json`;
  console.log('Creating backup:', filename);
  
  return Promise.resolve({
    success: true,
    message: 'Backup created successfully',
    filename,
    timestamp: timestamp.toISOString()
  } as unknown as T);
}

function handleBackupListEndpoint<T>(): Promise<T> {
  const backupHistory = JSON.parse(localStorage.getItem('backupsHistory') || '[]');
  return Promise.resolve({
    success: true,
    backups: backupHistory
  } as unknown as T);
}

function handleBackupRestoreEndpoint<T>(): Promise<T> {
  console.log('Restoring from backup');
  return Promise.resolve({
    success: true,
    message: 'Backup restored successfully'
  } as unknown as T);
}
