
import React, { useState, useRef } from 'react';
import { Menu, Bell, Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Default company information - updated to use TeamSphere as default
  const [companyLogo, setCompanyLogo] = useState(localStorage.getItem('companyLogo') || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=50&h=50&q=80');
  const companyName = localStorage.getItem('companyName') || 'TeamSphere';
  const [showLogoDialog, setShowLogoDialog] = useState(false);

  // Convert uploaded file to data URL and save it
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (file.type.startsWith('image/')) {
        // Check file size (max 2MB)
        if (file.size <= 2 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            localStorage.setItem('companyLogo', base64String);
            setCompanyLogo(base64String);
            setShowLogoDialog(false);
            toast({
              title: "Logo updated",
              description: "Your company logo has been updated successfully."
            });
          };
          reader.readAsDataURL(file);
        } else {
          toast({
            title: "File too large",
            description: "Logo image must be less than 2MB",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (jpg, png, etc.)",
          variant: "destructive"
        });
      }
    }
  };

  // Handle logo click to open upload dialog
  const handleLogoClick = () => {
    setShowLogoDialog(true);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle company name click to change name
  const handleNameClick = () => {
    const newName = prompt('Enter company name:', companyName);
    if (newName && newName.trim() !== '') {
      localStorage.setItem('companyName', newName);
      window.location.reload(); // Simple way to refresh the component
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-[#2c3e50] to-[#3498db] dark:from-[#1A1F2C] dark:to-[#2c3e50] px-4 md:px-6">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden bg-white/10 hover:bg-white/20 border-0">
              <Menu className="h-5 w-5 text-white" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        // Company logo and name section (desktop)
        <div className="flex items-center space-x-4 mr-4">
          <div 
            className="w-10 h-10 rounded-md overflow-hidden cursor-pointer flex-shrink-0 border border-white/30"
            onClick={handleLogoClick}
            title="Click to change logo"
          >
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt="Company Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Handle image loading error
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=50&h=50&q=80';
                }}
              />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <Image className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          <div 
            className="text-lg font-semibold text-white cursor-pointer hover:underline"
            onClick={handleNameClick}
            title="Click to change company name"
          >
            {companyName}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 md:ml-auto md:gap-4">
        {/* Show title on mobile, or when not showing company name */}
        {isMobile && <h1 className="text-xl font-semibold text-white md:text-2xl">{title}</h1>}
        
        <div className="ml-auto flex-1 md:grow-0">
          <form>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full md:w-[200px] lg:w-[300px] bg-white/10 border-0 placeholder:text-white/70 text-white focus-visible:ring-white/30"
              />
            </div>
          </form>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>

      {/* File input for logo upload (hidden) */}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {/* Logo Upload Dialog */}
      <Dialog open={showLogoDialog} onOpenChange={setShowLogoDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Company Logo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-md overflow-hidden border border-gray-300">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="Current Logo" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=50&h=50&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Image className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
              <Button onClick={triggerFileInput} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Select Image
              </Button>
              <p className="text-sm text-muted-foreground">
                Recommended size: 200x200px. Max file size: 2MB
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
