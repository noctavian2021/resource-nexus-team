
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  LayoutGrid,
  FileText,
  Settings,
  Building2,
  HelpCircle,
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Define sidebar link props
interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  title: string;
}

// SidebarLink component
const SidebarLink = ({ to, icon: Icon, title }: SidebarLinkProps) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-white/80',
      isActive
        ? 'bg-white/15 text-white'
        : 'hover:bg-white/15 hover:text-white'
    )}
    end={to === "/" ? true : false}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{title}</span>
  </NavLink>
);

export default function Sidebar() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(true);
  const { user, logout } = useAuth();
  
  // Add error handling for user object
  const safeUser = user || { name: 'Guest', role: 'member' as const };
  
  console.log("Sidebar rendered, user:", safeUser);

  // Get user initials for avatar - with error handling
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={cn(
        "relative bg-gradient-to-b from-[#2c3e50] to-[#3498db] dark:from-[#1A1F2C] dark:to-[#2c3e50] z-10 h-screen group/sidebar overflow-hidden border-r border-white/10",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-full flex-col gap-y-2 p-3">
        <div className="flex items-center justify-between mb-2 px-3 h-12">
          <span
            className={cn(
              "font-semibold text-white overflow-hidden transition-all",
              isOpen ? "w-24 opacity-100" : "w-0 opacity-0",
            )}
          >
            Resource App
          </span>
          <button
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className={`h-1 w-4 bg-white/80 rounded-full relative transition-all ${isOpen ? 'rotate-0' : 'rotate-180'} before:content-[''] before:h-1 before:w-3 before:bg-white/80 before:rounded-full before:absolute before:top-1 before:transition-all after:content-[''] after:h-1 after:w-2 after:bg-white/80 after:rounded-full after:absolute after:bottom-1 after:transition-all`} />
          </button>
        </div>
        
        {/* User info section - with error handling */}
        {safeUser && (
          <div className="border-b border-white/10 pb-2 mb-2">
            <NavLink 
              to="/profile"
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10",
                !isOpen && "justify-center",
                isActive && "bg-white/15"
              )}
            >
              <Avatar className="h-7 w-7 bg-white/20 text-sm">
                <AvatarFallback className="text-white bg-blue-600">
                  {getInitials(safeUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "overflow-hidden transition-all",
                isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
              )}>
                <div className="text-sm font-medium text-white truncate">
                  {safeUser.name}
                </div>
                <div className="text-xs text-white/70 truncate">
                  {safeUser.role === 'admin' ? 'Administrator' : 'Team Lead'}
                </div>
              </div>
            </NavLink>
          </div>
        )}
        
        <div className="flex flex-col gap-y-2">
          <SidebarLink to="/" icon={BarChart3} title="Dashboard" />
          <SidebarLink to="/team" icon={Users} title="Team" />
          <SidebarLink to="/departments" icon={Building2} title="Departments" />
          <SidebarLink to="/projects" icon={LayoutGrid} title="Projects" />
          <SidebarLink to="/requests" icon={FileText} title="Requests" />
          <SidebarLink to="/help" icon={HelpCircle} title="Help" />
          <SidebarLink to="/profile" icon={User} title="Profile" />
        </div>
        <div className="mt-auto">
          {safeUser?.role === 'admin' && (
            <SidebarLink to="/admin/settings" icon={Settings} title="Admin" />
          )}
          
          {/* Logout button */}
          <div 
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer text-white/80 hover:bg-white/15 hover:text-white",
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className={cn(
              "font-medium",
              !isOpen && "hidden"
            )}>Logout</span>
          </div>
        </div>
        <div 
          className={cn(
            "flex items-center gap-x-2 px-3 py-2 text-white/70", 
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
