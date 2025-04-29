
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PDFViewer_Component, PDFDownloadButton } from './PDFReport';
import { TeamMember, Department, Project, ResourceRequest, AllocationData } from '@/data/mockData';

interface ViewReportDialogProps {
  open: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  departments: Department[];
  projects: Project[];
  resourceRequests: ResourceRequest[];
  allocationData: AllocationData[];
}

export function ViewReportDialog({
  open,
  onClose,
  teamMembers,
  departments,
  projects,
  resourceRequests,
  allocationData
}: ViewReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>General Report</DialogTitle>
            <DialogDescription>
              View and download the full report as PDF
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <PDFDownloadButton 
              teamMembers={teamMembers}
              departments={departments}
              projects={projects}
              resourceRequests={resourceRequests}
              allocationData={allocationData}
            />
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <PDFViewer_Component
            teamMembers={teamMembers}
            departments={departments}
            projects={projects}
            resourceRequests={resourceRequests}
            allocationData={allocationData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
