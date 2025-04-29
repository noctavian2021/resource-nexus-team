
import React from 'react';
import { Menu, Bell, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const isMobile = useIsMobile();
  // Default company information - in a real app this would come from user settings
  const companyLogo = localStorage.getItem('companyLogo') || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=50&h=50&q=80';
  const companyName = localStorage.getItem('companyName') || 'Resource Manager';

  // Handle logo click to change logo
  const handleLogoClick = () => {
    const newLogoUrl = prompt('Enter URL for company logo:', companyLogo);
    if (newLogoUrl && newLogoUrl.trim() !== '') {
      localStorage.setItem('companyLogo', newLogoUrl);
      window.location.reload(); // Simple way to refresh the component
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
    </header>
  );
}
