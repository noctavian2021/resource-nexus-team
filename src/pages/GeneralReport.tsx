
import React, { useState } from 'react';
import Header from '@/components/Layout/Header';
import { 
  teamMembers, 
  departments, 
  projects, 
  allocationData,
  ResourceRequest,
  resourceRequests
} from '@/data/mockData';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  FileText, 
  ChartPie, 
  ChartBar, 
  Users, 
  ClipboardList, 
  LayoutDashboard 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function GeneralReport() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  // Aggregate data for the report
  const totalTeamMembers = teamMembers.length;
  const totalDepartments = departments.length;
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const pendingRequests = resourceRequests.filter(r => r.status === 'Pending').length;
  
  // Calculate department statistics
  const departmentStats = departments.map(dept => {
    const membersInDept = teamMembers.filter(member => member.department === dept.name).length;
    const projectsInDept = projects.filter(project => project.departmentId === dept.id).length;
    return {
      ...dept,
      actualMemberCount: membersInDept,
      projectCount: projectsInDept
    };
  });

  // Calculate resource allocation by department
  const resourceAllocationByDept = departments.map(dept => {
    const deptData = allocationData.find(d => d.department === dept.name);
    return {
      name: dept.name,
      allocated: deptData?.allocated || 0,
      available: deptData?.available || 0,
      color: dept.color
    };
  });

  // Project status distribution for pie chart
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const projectStatusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const handleGeneratePDF = () => {
    toast({
      title: "Export Started",
      description: "Your report is being prepared for download.",
    });
    
    // In a real application, this would trigger PDF generation
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: "General report has been generated and downloaded.",
      });
    }, 2000);
  };

  const handleSendEmail = () => {
    toast({
      title: "Email Sent",
      description: "The general report has been emailed to stakeholders.",
    });
  };

  return (
    <>
      <Header title="General Report" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">General Report</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={handleGeneratePDF}
              className="bg-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              onClick={handleSendEmail}
              className="bg-primary"
            >
              Email Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="bg-background">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="departments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar className="h-4 w-4 mr-2" />
              Resource Allocation
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ClipboardList className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTeamMembers}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {totalDepartments} departments
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projects</CardTitle>
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeProjects} active projects
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resource Requests</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resourceRequests.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingRequests} pending requests
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {projectStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Department Resource Allocation</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={resourceAllocationByDept}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="allocated" name="Allocated (%)" fill="#8884d8" />
                        <Bar dataKey="available" name="Available (%)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
                <CardDescription>
                  Detailed information about each department and their team composition.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Team Size</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Resource Allocation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentStats.map((dept) => {
                      const lead = teamMembers.find(member => member.id === dept.leadId);
                      const allocation = allocationData.find(d => d.department === dept.name);
                      
                      return (
                        <TableRow key={dept.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: dept.color }}
                              ></div>
                              {dept.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={lead.avatar} alt={lead.name} />
                                  <AvatarFallback>{lead.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <span>{lead.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>{dept.actualMemberCount}/{dept.memberCount}</TableCell>
                          <TableCell>{dept.projectCount}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-secondary h-2 rounded-full">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${allocation?.allocated || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{allocation?.allocated || 0}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resource Allocation Tab */}
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Member Allocation</CardTitle>
                <CardDescription>
                  Current resource allocation across all team members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Availability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => {
                      const memberProjects = projects.filter(p => 
                        p.teamMembers.includes(member.id)
                      );
                      
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              {member.name}
                            </div>
                          </TableCell>
                          <TableCell>{member.department}</TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {memberProjects.length > 0 ? memberProjects.map(project => (
                                <Badge key={project.id} variant="outline" className="bg-secondary/30">
                                  {project.name}
                                </Badge>
                              )) : (
                                <span className="text-muted-foreground">No projects</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-secondary h-2 rounded-full">
                                <div 
                                  className={cn(
                                    "h-2 rounded-full", 
                                    member.availability < 30 ? "bg-red-500" : 
                                    member.availability < 60 ? "bg-amber-500" : "bg-green-500"
                                  )}
                                  style={{ width: `${100 - member.availability}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{member.availability}% available</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resource Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Requests Overview</CardTitle>
                <CardDescription>
                  All current resource requests across departments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Title</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Required Skills</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resourceRequests.map((request) => {
                      const requestingDept = departments.find(d => d.id === request.requestingDepartmentId);
                      const targetDept = departments.find(d => d.id === request.targetDepartmentId);
                      const requester = teamMembers.find(m => m.id === request.requesterId);
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.title}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{requestingDept?.name}</span>
                              <span className="text-xs text-muted-foreground">{requester?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{targetDept?.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {request.requiredSkills.map(skill => (
                                <Badge key={skill} variant="secondary" className="bg-secondary/30">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs">
                                {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              request.status === 'Pending' && "bg-amber-100 text-amber-800 hover:bg-amber-100",
                              request.status === 'Approved' && "bg-green-100 text-green-800 hover:bg-green-100",
                              request.status === 'Declined' && "bg-red-100 text-red-800 hover:bg-red-100",
                            )}>
                              {request.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
