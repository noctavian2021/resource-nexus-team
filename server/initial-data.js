
// Copy of our initial mock data
const teamMembers = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Senior Developer',
    department: 'Engineering',
    email: 'alex@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    skills: ['React', 'TypeScript', 'Node.js'],
    availability: 25,
    projects: ['1', '3']
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
    projects: ['1', '2', '4']
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

const departments = [
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

const projects = [
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

module.exports = {
  teamMembers,
  departments,
  projects
};
