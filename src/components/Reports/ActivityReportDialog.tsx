
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Mail } from "lucide-react";
import { Activity } from '@/data/mockData';
import { ActivityReportViewer, ActivityReportDownloadButton } from './ActivityReportPDF';
import { useToast } from '@/hooks/use-toast';
import { useEmailConfig } from '@/hooks/useEmailConfig';

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

  const handleSendEmail = () => {
    // This would connect to an actual email sending service in a real app
    if (emailConfig.enabled) {
      toast({
        title: "Email Sent",
        description: "The activity report has been emailed to stakeholders.",
      });
    } else {
      toast({
        title: "Email Not Configured",
        description: "Please configure email settings in Admin > Settings before sending emails.",
        variant: "destructive",
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
              View and download recent activities as PDF
            </DialogDescription>
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
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ActivityReportViewer
            activities={activities}
            teamMembers={teamMembers}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
