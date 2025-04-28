
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
import { teamMembers } from '@/data/mockData';
import { Mail } from 'lucide-react';
import { sendWelcomePackage } from '@/services/teamService';

export default function SendWelcomeDialog() {
  const [email, setEmail] = React.useState("");
  const [replacingMember, setReplacingMember] = React.useState("");
  const [additionalNotes, setAdditionalNotes] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const { emailConfig } = useEmailConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!emailConfig.enabled) {
        toast({
          title: "Email not configured",
          description: "Please configure email settings in the admin panel first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Send welcome package through the API
      await sendWelcomePackage({
        email,
        replacingMember,
        additionalNotes
      });

      toast({
        title: "Welcome package sent",
        description: "The welcome package has been sent successfully.",
      });

      setIsOpen(false);
      setEmail("");
      setReplacingMember("");
      setAdditionalNotes("");
    } catch (error) {
      console.error("Error sending welcome package:", error);
      toast({
        title: "Error",
        description: "Failed to send welcome package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Send Welcome Package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Welcome Package</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">New Member Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="new.member@company.com"
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
