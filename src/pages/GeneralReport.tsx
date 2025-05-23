
import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import { 
  teamMembers as initialTeamMembers, 
  departments as initialDepartments, 
  projects as initialProjects, 
  resourceRequests,
  TeamMember
} from '@/data/mockData';
import { getTeamMembers } from '@/services/teamService';
import { getDepartments } from '@/services/departmentService';
import { getProjects } from '@/services/projectService';
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
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Building, 
  Building2,
  LayoutGrid,
  GitFork
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ViewReportDialog } from '@/components/Reports/ViewReportDialog';
import OrgTreeView from '@/components/Reports/OrgTreeView';

export default function OrgMapPage() {
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [teamMembersData, setTeamMembersData] = useState(initialTeamMembers);
  const [departmentsData, setDepartmentsData] = useState(initialDepartments);
  const [projectsData, setProjectsData] = useState(initialProjects);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch latest data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch latest data from API/mock services
        const [members, depts, projs] = await Promise.all([
          getTeamMembers(),
          getDepartments(),
          getProjects()
        ]);
        
        if (members) setTeamMembersData(members);
        if (depts) setDepartmentsData(depts);
        if (projs) setProjectsData(projs);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to initial mock data if API fails
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Find directors
  const directors = teamMembersData.filter(member => member.role === 'Director');
  
  // Get active projects
  const activeProjects = projectsData.filter(p => p.status === 'Active');
  
  const allocationData = [
    { name: 'Development', allocation: 35, value: 35 },
    { name: 'Design', allocation: 20, value: 20 },
    { name: 'Marketing', allocation: 15, value: 15 },
    { name: 'Operations', allocation: 18, value: 18 },
    { name: 'HR', allocation: 12, value: 12 }
  ];

  const handleGeneratePDF = () => {
    setShowPDFViewer(true);
    console.log("Showing PDF viewer dialog");
  };

  const handleSendEmail = () => {
    toast({
      title: "Email Sent",
      description: "The organization map has been emailed to stakeholders.",
    });
  };

  return (
    <>
      <Header title="Organization Map" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Organization Map</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center bg-secondary/20 rounded-md p-1 mr-2">
              <Button 
                variant={viewMode === 'table' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode('table')}
                className="gap-1"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Table View</span>
              </Button>
              <Button 
                variant={viewMode === 'tree' ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode('tree')}
                className="gap-1"
              >
                <GitFork className="h-4 w-4" />
                <span className="hidden sm:inline">Tree View</span>
              </Button>
            </div>
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
              Email Organization Map
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading organization data...</p>
          </div>
        ) : viewMode === 'tree' ? (
          <OrgTreeView 
            directors={directors}
            departments={departmentsData}
            teamMembers={teamMembersData}
          />
        ) : (
          // Original Table View
          <>
            {/* Directors Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Directors
                </CardTitle>
                <CardDescription>
                  Directors have full access to all departments and projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {directors.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {directors.map((director) => (
                      <Card key={director.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={director.avatar} alt={director.name} />
                                <AvatarFallback>{director.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{director.name}</h3>
                                <p className="text-sm text-muted-foreground">{director.role}</p>
                              </div>
                            </div>
                            <p className="mt-2 text-sm">{director.email}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">No directors assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Departments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Departments
                </CardTitle>
                <CardDescription>
                  Department structure and team members
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Team Size</TableHead>
                      <TableHead>Members</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentsData.map((dept) => {
                      const lead = teamMembersData.find(member => member.id === dept.leadId);
                      const deptMembers = teamMembersData.filter(
                        member => member.department === dept.name && member.id !== dept.leadId
                      );
                      
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
                          <TableCell>{deptMembers.length + (lead ? 1 : 0)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {deptMembers.length > 0 ? (
                                deptMembers.slice(0, 3).map((member) => (
                                  <Badge key={member.id} variant="outline" className="bg-secondary/30">
                                    {member.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground">No additional members</span>
                              )}
                              {deptMembers.length > 3 && (
                                <Badge variant="outline" className="bg-primary/20">
                                  +{deptMembers.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Active Projects Section */}
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>
                  Currently active projects across departments
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Team Members</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeProjects.map((project) => {
                      const dept = departmentsData.find(d => d.id === project.departmentId);
                      const projectMembers = project.teamMembers
                        .map(id => teamMembersData.find(m => m.id === id))
                        .filter(Boolean) as TeamMember[];
                      
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.name}
                          </TableCell>
                          <TableCell>
                            {dept ? (
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: dept.color }}
                                ></div>
                                {dept.name}
                              </div>
                            ) : 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-secondary h-2 rounded-full">
                                <div 
                                  className={cn(
                                    "h-2 rounded-full bg-primary"
                                  )}
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{project.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {projectMembers.slice(0, 3).map((member) => (
                                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                                  <AvatarImage src={member.avatar} alt={member.name} />
                                  <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {projectMembers.length > 3 && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-secondary text-xs">
                                  +{projectMembers.length - 3}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {activeProjects.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No active projects found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <ViewReportDialog
        open={showPDFViewer}
        onClose={() => setShowPDFViewer(false)}
        teamMembers={teamMembersData}
        departments={departmentsData}
        projects={projectsData}
        resourceRequests={resourceRequests}
        allocationData={allocationData}
      />
    </>
  );
}

