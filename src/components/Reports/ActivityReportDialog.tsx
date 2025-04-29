
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Mail, Calendar, Clock, Users, Download } from "lucide-react";
import { Activity } from '@/data/mockData';
import { ActivityReportViewer, ActivityReportDownloadButton } from './ActivityReportPDF';
import { useToast } from '@/hooks/use-toast';
import { useEmailConfig } from '@/hooks/useEmailConfig';
import { useScheduledReports } from '@/hooks/useScheduledReports';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTeamMemberById, teamMembers } from '@/data/mockData';

interface ActivityReportDialogProps {
  open: boolean;
  onClose: () => void;
  activities: Activity[];
  teamMembers: any[];
}

export function ActivityReportDialog({
  open,
  onClose,
  activities,
  teamMembers
}: ActivityReportDialogProps) {
  const { toast } = useToast();
  const { emailConfig } = useEmailConfig();
  const { 
    scheduleConfig, 
    updateScheduleConfig, 
    sendReportNow,
    isEmailConfigured 
  } = useScheduledReports();
  
  const [activeTab, setActiveTab] = useState<string>("preview");
  
  // Filter to get only department leads
  const departmentLeads = teamMembers.filter(member => 
    member.role === 'Department Lead' || member.role === 'Director'
  );
  
  const handleSendEmail = () => {
    // This would connect to an actual email sending service in a real app
    if (emailConfig.enabled) {
      const success = sendReportNow();
      
      if (success) {
        toast({
          title: "Email Sent",
          description: "The activity report has been emailed to stakeholders.",
        });
      }
    } else {
      toast({
        title: "Email Not Configured",
        description: "Please configure email settings in Admin > Settings before sending emails.",
        variant: "destructive",
      });
    }
  };
  
  const handleScheduleToggle = (enabled: boolean) => {
    updateScheduleConfig({ enabled });
    
    if (enabled) {
      toast({
        title: "Scheduling Enabled",
        description: `Activity reports will be sent at ${scheduleConfig.sendTime} ${scheduleConfig.frequency}.`,
      });
    } else {
      toast({
        title: "Scheduling Disabled",
        description: "Activity reports will no longer be sent automatically.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Activity Report</DialogTitle>
            <DialogDescription>
              View, download, and schedule activity reports
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Report Preview</TabsTrigger>
            <TabsTrigger value="schedule">Email Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="flex-1 p-0 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Preview of the activity report
              </div>
              <div className="flex items-center gap-2">
                <ActivityReportDownloadButton 
                  activities={activities}
                  teamMembers={teamMembers}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSendEmail}
                  disabled={!emailConfig.enabled}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Report
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ActivityReportViewer
                activities={activities}
                teamMembers={teamMembers}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Daily Email Schedule</CardTitle>
                <CardDescription>
                  Configure automatic delivery of the activity report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Daily Scheduling</Label>
                    <p className="text-sm text-muted-foreground">
                      Activity reports will be sent to leads every day at the specified time
                    </p>
                  </div>
                  <Switch 
                    checked={scheduleConfig.enabled} 
                    onCheckedChange={handleScheduleToggle}
                    disabled={!isEmailConfigured}
                  />
                </div>
                
                {!isEmailConfigured && (
                  <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-500">
                    Email must be configured in Admin Settings before scheduling can be enabled.
                  </div>
                )}
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="sendTime">Send Time (Daily)</Label>
                    <Input 
                      id="sendTime"
                      type="time" 
                      value={scheduleConfig.sendTime}
                      onChange={(e) => updateScheduleConfig({ sendTime: e.target.value })}
                      disabled={!isEmailConfigured}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select 
                      value={scheduleConfig.frequency} 
                      onValueChange={(value) => updateScheduleConfig({ 
                        frequency: value as 'daily' | 'weekly' | 'monthly' 
                      })}
                      disabled={!isEmailConfigured || true} // Currently only supporting daily
                    >
                      <SelectTrigger id="frequency" className="w-full">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly" disabled>Weekly (Coming Soon)</SelectItem>
                          <SelectItem value="monthly" disabled>Monthly (Coming Soon)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Recipients (Department Leads)</Label>
                  <div className="mt-2 space-y-2">
                    {departmentLeads.map(lead => (
                      <div key={lead.id} className="flex items-center gap-2">
                        <Switch 
                          id={`lead-${lead.id}`}
                          checked={scheduleConfig.recipients.includes(lead.email)}
                          onCheckedChange={(checked) => {
                            const newRecipients = checked
                              ? [...scheduleConfig.recipients, lead.email]
                              : scheduleConfig.recipients.filter(email => email !== lead.email);
                            
                            updateScheduleConfig({ recipients: newRecipients });
                          }}
                          disabled={!isEmailConfigured}
                        />
                        <Label htmlFor={`lead-${lead.id}`} className="cursor-pointer">
                          {lead.name} - {lead.email} ({lead.department})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              className="w-full"
              disabled={!isEmailConfigured || !scheduleConfig.enabled || scheduleConfig.recipients.length === 0}
              onClick={handleSendEmail}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Test Email Now
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
