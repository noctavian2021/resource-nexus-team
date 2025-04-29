
import React from 'react';
import Header from '@/components/Layout/Header';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, BookOpen, HelpCircle, Users, Building2, LayoutGrid, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelpTab() {
  return (
    <>
      <Header title="Help & Documentation" />
      <main className="flex-1 space-y-6 p-6 overflow-y-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Help & Documentation</h1>
          <p className="text-muted-foreground">
            Find detailed guidance on how to use the Resource Management Application.
          </p>
        </div>

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="team-management">Team Management</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="resource-requests">Resource Requests</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> 
                  Getting Started
                </CardTitle>
                <CardDescription>
                  Learn the basics of the Resource Management Application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <HelpSection 
                  title="Dashboard Overview"
                  content="The dashboard provides a high-level overview of your organization's resource allocation, recent activities, and key metrics. Use the charts to understand resource distribution across departments and projects. The Recent Activity section shows the latest changes in resource allocations and team updates. You can also generate and download Activity Reports as PDFs from the dashboard."
                />
                
                <HelpSection 
                  title="Navigation"
                  content={
                    <div className="space-y-2">
                      <p>The application has the following main sections accessible from the sidebar:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Dashboard:</strong> Overview of resource allocation and metrics</li>
                        <li><strong>Team:</strong> Manage team members and their availability</li>
                        <li><strong>Departments:</strong> Organize and oversee departmental resources</li>
                        <li><strong>Projects:</strong> Track projects and their resource requirements</li>
                        <li><strong>Requests:</strong> Handle resource allocation requests</li>
                        <li><strong>Help:</strong> Access documentation and guidance</li>
                        <li><strong>Admin:</strong> Configure application settings</li>
                      </ul>
                    </div>
                  }
                />
                
                <HelpSection 
                  title="Key Features"
                  content={
                    <div className="space-y-2">
                      <p>The Resource Management Application offers these key features:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Team member availability tracking with vacation management</li>
                        <li>Department structure visualization and management</li>
                        <li>Project resource allocation and monitoring</li>
                        <li>Resource request workflow management with notifications</li>
                        <li>Email notifications for important updates and resource requests</li>
                        <li>Activity reports with PDF generation and email sharing</li>
                        <li>Organizational reporting and analytics</li>
                      </ul>
                    </div>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team-management" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> 
                  Team Management
                </CardTitle>
                <CardDescription>
                  Learn how to manage team members and their availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <HelpSection 
                  title="Adding Team Members"
                  content="To add a new team member, navigate to the Team page and click the 'Add Team Member' button. Fill in the required information including name, email, role, department, and availability status. You can also set vacation periods for team members by toggling the vacation option and selecting dates."
                />
                
                <HelpSection 
                  title="Editing Team Member Details"
                  content="To edit a team member's details, find their card in the Team page and click the 'Edit' button. You can update their personal information, change their role or department, adjust their availability status, or set vacation periods. Click 'Save changes' when done."
                />
                
                <HelpSection 
                  title="Managing Vacation Time"
                  content="The system allows you to track when team members are on vacation. To set a vacation period, edit the team member's profile, toggle 'On Vacation', and select start and end dates. Team members on vacation will be highlighted in the team list to easily identify their availability status."
                />
                
                <HelpSection 
                  title="Sending Welcome Emails"
                  content="After adding a new team member, you can send them a welcome email by clicking the 'Send Welcome' button on their card. This requires email configuration to be set up in the Admin settings. The welcome email includes their login information and a brief introduction to the system."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" /> 
                  Departments
                </CardTitle>
                <CardDescription>
                  Learn how to manage departmental structures and resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <HelpSection 
                  title="Creating Departments"
                  content="To create a new department, go to the Departments page and click 'Add Department'. Enter the department name, select a manager from existing team members, and provide a brief description of the department's function. You can also set the maximum capacity for resource allocation."
                />
                
                <HelpSection 
                  title="Department Details"
                  content="Click on any department card to view detailed information about that department, including team members assigned to it, current resource allocation, ongoing projects, and historical data. You can export this information as a PDF report for sharing with stakeholders."
                />
                
                <HelpSection 
                  title="Managing Department Resources"
                  content="Within each department detail page, you can manage resource allocations by adding or removing team members, adjusting capacity, or reassigning resources to different projects. Use the charts to visualize current resource distribution and identify potential bottlenecks."
                />
                
                <HelpSection 
                  title="Department Reports"
                  content="Generate department-specific reports by navigating to the department detail page and clicking 'View Report'. These reports provide insights into resource utilization, project allocation, and efficiency metrics. Reports can be customized to include specific date ranges and metrics."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5" /> 
                  Projects
                </CardTitle>
                <CardDescription>
                  Learn how to manage projects and track resource allocation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <HelpSection 
                  title="Creating Projects"
                  content="To create a new project, navigate to the Projects page and click 'Add Project'. Enter the project name, description, start and end dates, and select the department responsible for the project. You can also assign a project manager and set the initial resource requirements."
                />
                
                <HelpSection 
                  title="Assigning Resources"
                  content="From the project detail view, you can assign team members to the project by clicking 'Assign Resources'. Select team members from the available pool, specify the allocation percentage and duration. The system will automatically check for resource conflicts and availability constraints."
                />
                
                <HelpSection 
                  title="Project Timeline"
                  content="Each project has a timeline view showing key milestones, resource allocation periods, and deadlines. Use this view to identify potential resource bottlenecks or timeline conflicts. You can adjust the timeline by dragging elements or using the edit function."
                />
                
                <HelpSection 
                  title="Project Completion"
                  content="When a project is completed, update its status to 'Completed'. This will trigger a project wrap-up workflow, including resource release, final reporting, and archiving. Completed projects remain in the system for historical reference but no longer appear in active resource allocation calculations."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resource-requests" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> 
                  Resource Requests
                </CardTitle>
                <CardDescription>
                  Learn how to submit and process resource allocation requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <HelpSection 
                  title="Creating Resource Requests"
                  content="To request resources for a project, navigate to the Resource Requests page and click 'Create Request'. Specify the project, required skills, number of resources needed, allocation percentage, and duration. You can also add notes to provide additional context for the approvers."
                />
                
                <HelpSection 
                  title="Request Workflow"
                  content={
                    <div className="space-y-2">
                      <p>Resource requests follow this approval workflow:</p>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li><strong>Submitted:</strong> Initial request created</li>
                        <li><strong>Under Review:</strong> Department managers evaluate availability</li>
                        <li><strong>Approved/Rejected:</strong> Final decision made</li>
                        <li><strong>Allocated:</strong> Resources assigned to the project</li>
                      </ol>
                      <p>Each stage triggers notifications to relevant stakeholders.</p>
                    </div>
                  }
                />
                
                <HelpSection 
                  title="Approving/Rejecting Requests"
                  content="Department managers and resource coordinators can approve or reject requests from the Resource Requests page. Click on a request card to view details, then use the Approve or Reject buttons. When rejecting, provide a reason that will be communicated back to the requester."
                />
                
                <HelpSection 
                  title="Request Notifications"
                  content="When a department lead submits a request to another department lead, the system automatically sends in-app notifications and email alerts (if email is configured). This ensures timely responses to resource requests and keeps all stakeholders informed about request status changes."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" /> 
                  Notifications & Reports
                </CardTitle>
                <CardDescription>
                  Understand the notification system and reporting features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <HelpSection 
                  title="Notification System"
                  content="The application includes a comprehensive notification system that alerts users about important events. Notifications appear in the bell icon in the sidebar. Clicking the bell icon shows all your notifications, with unread notifications highlighted. You can mark notifications as read individually or all at once."
                />
                
                <HelpSection 
                  title="Email Notifications"
                  content="In addition to in-app notifications, the system can send email alerts for critical events such as new resource requests, request status changes, and report sharing. Email notifications require configuration in the Admin Settings. If email settings are not configured, users will see an alert when attempting to use email-related features."
                />
                
                <HelpSection 
                  title="Activity Reports"
                  content="The dashboard includes an Activity Report feature that captures all recent activities in the system. You can access this by clicking 'View Activity Report' in the Recent Activity section. This report provides a comprehensive record of changes and actions taken within the system, useful for auditing and tracking changes over time."
                />
                
                <HelpSection 
                  title="Generating PDF Reports"
                  content="Activity Reports and other system reports can be exported as PDF documents for sharing or record-keeping. In the report dialog, click the 'Download PDF' button to save a copy to your computer. You can also email reports directly to stakeholders by clicking the 'Email Report' button if email has been configured in Admin Settings."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

interface HelpSectionProps {
  title: string;
  content: React.ReactNode;
}

function HelpSection({ title, content }: HelpSectionProps) {
  return (
    <Collapsible className="w-full border rounded-lg">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex w-full justify-between p-4 font-medium"
        >
          {title}
          <ChevronDown className="h-4 w-4 transition-all [&[data-state=open]>svg]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <div className="text-sm text-muted-foreground">
          {content}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
