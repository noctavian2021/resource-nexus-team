import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useEmailConfig } from "@/hooks/useEmailConfig";
import { TeamMember } from '@/data/mockData';
import { Mail, AlertTriangle } from 'lucide-react';
import { sendWelcomePackage, RequiredResource } from '@/services/teamService';
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ResourceWithSelection extends RequiredResource {
  selected: boolean;
}

interface SendWelcomeDialogProps {
  teamMembers: TeamMember[];
  onRefreshList?: () => Promise<void>;
}

export default function SendWelcomeDialog({ teamMembers, onRefreshList }: SendWelcomeDialogProps) {
  const [email, setEmail] = React.useState("");
  const [replacingMember, setReplacingMember] = React.useState("");
  const [additionalNotes, setAdditionalNotes] = React.useState("");
  const [selectedMember, setSelectedMember] = React.useState<string | null>(null);
  const [requiredResources, setRequiredResources] = React.useState<ResourceWithSelection[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const { emailConfig } = useEmailConfig();

  // Find selected team member and their resources
  React.useEffect(() => {
    if (selectedMember) {
      const member = teamMembers.find(m => m.id === selectedMember);
      if (member && member.requiredResources) {
        // Add selected property to each resource
        setRequiredResources(
          member.requiredResources.map(resource => ({
            ...resource,
            selected: false
          }))
        );
      } else {
        setRequiredResources([]);
      }
    }
  }, [selectedMember, teamMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!email) {
        toast({
          title: "Email Required",
          description: "Please enter an email address for the team member.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Only include selected resources
      const selectedResources = requiredResources
        .filter(resource => resource.selected)
        .map(({ selected, ...resource }) => resource);

      console.log("Sending welcome package with:", {
        email,
        replacingMember,
        resources: selectedResources.length,
        emailConfigEnabled: emailConfig.enabled
      });
      
      // Pass email config directly to the service which will handle normalization
      // Using the same approach as the successful email test service
      try {
        await sendWelcomePackage({
          email,
          replacingMember,
          additionalNotes,
          requiredResources: selectedResources,
          emailConfig: emailConfig // Service will normalize this exactly like test email
        });

        toast({
          title: "Welcome package sent",
          description: emailConfig.enabled 
            ? "The welcome package has been sent via email."
            : "The welcome package has been processed (email notifications disabled).",
        });

        // Refresh the team members list if a callback is provided
        if (onRefreshList) {
          await onRefreshList();
        }

        setIsOpen(false);
        setEmail("");
        setReplacingMember("");
        setAdditionalNotes("");
        setSelectedMember(null);
        setRequiredResources([]);
      } catch (apiError: any) {
        console.error("API Error:", apiError);
        
        // Enhanced error messages using the same patterns as email test service
        let errorMessage = apiError.message || "Failed to send welcome package";
        
        // Use the same error handling as the successful email test service
        if (errorMessage.includes('SSL routines') || errorMessage.includes('wrong version number')) {
          errorMessage = `SSL/TLS connection failed. Your email port ${emailConfig.port} with secure=${emailConfig.secure} settings don't match. For port 587, secure should be false. For port 465, secure should be true.`;
        }
        
        if (errorMessage.includes('Invalid login') || errorMessage.includes('authentication failed') || 
            errorMessage.includes('Username and Password not accepted')) {
          errorMessage = "Email authentication failed. Please verify your username and password. If you're using Gmail or Yahoo with 2FA, make sure you're using an App Password.";
        }
        
        if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('Connection timed out') || 
            errorMessage.includes('Greeting never received')) {
          errorMessage = "Connection to email server timed out. This could be due to network issues or incorrect server settings. Please check for security alerts in your email account and verify your provider settings.";
        }
        
        setError(errorMessage);
        toast({
          title: "Email Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error sending welcome package:", error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: error.message || "Failed to send welcome package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    // If the dialog is opening, refresh the team list first to ensure we have the latest data
    if (open && onRefreshList) {
      onRefreshList().catch(error => {
        console.error("Error refreshing team members:", error);
      });
    }
    setIsOpen(open);
    
    // Clear errors when dialog is closed
    if (!open) {
      setError(null);
    }
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId);
    if (memberId !== 'none') {
      const member = teamMembers.find(m => m.id === memberId);
      if (member && member.email) {
        setEmail(member.email);
      }
    }
  };

  const toggleResource = (resourceIndex: number) => {
    setRequiredResources(prev => {
      const updated = [...prev];
      updated[resourceIndex] = {
        ...updated[resourceIndex],
        selected: !updated[resourceIndex].selected
      };
      return updated;
    });
  };

  // Get SSL configuration help text based on current settings
  const getSslHelpText = () => {
    if (!emailConfig.enabled) return null;
    
    const { port, secure } = emailConfig;
    
    if (port === '587' && secure) {
      return "You're using port 587 with secure=true. This port typically uses STARTTLS (secure=false).";
    }
    
    if (port === '465' && !secure) {
      return "You're using port 465 with secure=false. This port requires SSL/TLS (secure=true).";
    }
    
    return null;
  };
  
  const sslHelpText = getSslHelpText();

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Send Welcome Package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Welcome Package</DialogTitle>
        </DialogHeader>
        
        {!emailConfig.enabled && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Email Notifications Disabled</AlertTitle>
            <AlertDescription>
              Email notifications are currently disabled. The welcome package will be processed but no email will be sent.
              You can enable email notifications in the Admin Settings.
            </AlertDescription>
          </Alert>
        )}
        
        {sslHelpText && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>SSL/TLS Configuration Warning</AlertTitle>
            <AlertDescription>{sslHelpText}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member">Team Member</Label>
            <Select 
              value={selectedMember || ''} 
              onValueChange={handleMemberSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">New Member (Not in system)</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Member Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="team.member@company.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="replacing">Replacing Team Member</Label>
            <Select value={replacingMember} onValueChange={setReplacingMember}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member being replaced (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiredResources.length > 0 && (
            <div className="space-y-3">
              <Label>Required Resources</Label>
              <div className="border rounded-md p-3 space-y-3 max-h-[200px] overflow-y-auto">
                {requiredResources.map((resource, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <Checkbox 
                      id={`resource-${idx}`}
                      checked={resource.selected}
                      onCheckedChange={() => toggleResource(idx)}
                    />
                    <div className="space-y-1">
                      <Label 
                        htmlFor={`resource-${idx}`}
                        className="text-sm font-medium"
                      >
                        {resource.name} ({resource.type})
                      </Label>
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Add any specific instructions or welcome message..."
              className="h-24"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Package"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
