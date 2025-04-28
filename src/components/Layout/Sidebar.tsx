import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Users,
  LayoutGrid,
  FileText,
  Settings,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import NotificationBell from "./NotificationBell";

const SidebarLink = ({
  to,
  icon: Icon,
  title,
  isActive,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  isActive: boolean;
}) => (
  <NavLink
    to={to}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    )}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{title}</span>
  </NavLink>
);

export default function Sidebar() {
  const { isMobile, isOpen, setIsOpen } = useMobile();

  return (
    <aside
      className={cn(
        "relative bg-background z-10 h-screen group/sidebar overflow-hidden border-r",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-full flex-col gap-y-2 p-3">
        <div className="flex items-center justify-between mb-2 px-3 h-12">
          <span
            className={cn(
              "font-semibold overflow-hidden transition-all",
              isOpen ? "w-24 opacity-100" : "w-0 opacity-0",
            )}
          >
            Resource App
          </span>
          <button
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className={`h-1 w-4 bg-foreground/80 rounded-full relative transition-all ${isOpen ? 'rotate-0' : 'rotate-180'} before:content-[''] before:h-1 before:w-3 before:bg-foreground/80 before:rounded-full before:absolute before:top-1 before:transition-all after:content-[''] after:h-1 after:w-2 after:bg-foreground/80 after:rounded-full after:absolute after:bottom-1 after:transition-all`} />
          </button>
        </div>
        <div className="flex flex-col gap-y-2">
          <SidebarLink to="/" icon={BarChart3} title="Dashboard" />
          <SidebarLink to="/team" icon={Users} title="Team" />
          <SidebarLink to="/departments" icon={Building2} title="Departments" />
          <SidebarLink to="/projects" icon={LayoutGrid} title="Projects" />
          <SidebarLink to="/requests" icon={FileText} title="Requests" />
        </div>
        <div className="mt-auto">
          <SidebarLink to="/admin/settings" icon={Settings} title="Admin" />
        </div>
        <div 
          className={cn(
            "flex items-center gap-x-2 px-3 py-2", 
            isOpen ? "justify-between" : "justify-center"
          )}
        >
          {isOpen && <span className="text-sm font-medium">Notifications</span>}
          <NotificationBell />
        </div>
      </div>
    </aside>
  );
}
