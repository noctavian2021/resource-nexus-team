
import React from 'react';
import { Menu, Bell } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}
      
      <div className="flex items-center gap-2 md:ml-auto md:gap-4">
        <h1 className="text-xl font-semibold md:text-2xl lg:hidden">{title}</h1>
        <div className="ml-auto flex-1 md:grow-0">
          <form>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}
