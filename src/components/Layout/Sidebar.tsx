
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
        ? 'bg-white/15 text-white font-medium'
        : 'hover:bg-white/15 hover:text-white'
    )}
    end={to === "/" ? true : false}
  >
    <div className="flex items-center justify-center w-6 h-6">
      <Icon className="h-5 w-5" />
    </div>
    <span className="font-medium transition-all">{title}</span>
  </NavLink>
);

export default function Sidebar() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(true);
  const { user, logout } = useAuth();
  
  console.log("Sidebar rendered, user:", user);

  // Get user initials for avatar
  const getInitials = (name: string) => {
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
        "relative bg-gradient-to-b from-[#2c3e50] to-[#3498db] dark:from-[#1A1F2C] dark:to-[#2c3e50] z-10 h-screen overflow-hidden border-r border-white/10 shadow-xl transition-all duration-300",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-full flex-col gap-y-2 p-3">
        <div className="flex items-center justify-between mb-4 px-3 h-12">
          <div className={cn(
            "font-bold text-white overflow-hidden transition-all flex items-center",
            isOpen ? "w-28 opacity-100" : "w-0 opacity-0",
          )}>
            <span className="text-gradient text-lg">TeamSphere</span>
          </div>
          <button
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className={`h-1 w-4 bg-white/80 rounded-full relative transition-all ${isOpen ? 'rotate-0' : 'rotate-180'} before:content-[''] before:h-1 before:w-3 before:bg-white/80 before:rounded-full before:absolute before:top-1 before:transition-all after:content-[''] after:h-1 after:w-2 after:bg-white/80 after:rounded-full after:absolute after:bottom-1 after:transition-all`} />
          </button>
        </div>
        
        {/* User info section */}
        {user && (
          <div className="border-b border-white/10 pb-4 mb-4">
            <NavLink 
              to="/profile"
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all",
                !isOpen && "justify-center",
                isActive && "bg-white/15"
              )}
            >
              <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 text-sm border-2 border-white/20">
                <AvatarFallback className="text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "overflow-hidden transition-all",
                isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
              )}>
                <div className="text-sm font-medium text-white truncate">
                  {user.name}
                </div>
                <div className="text-xs text-white/70 truncate">
                  {user.role === 'admin' ? 'Administrator' : 'Team Lead'}
                </div>
              </div>
            </NavLink>
          </div>
        )}
        
        <div className="flex flex-col gap-y-1 px-1">
          <SidebarLink to="/" icon={BarChart3} title="Dashboard" />
          <SidebarLink to="/team" icon={Users} title="Team" />
          <SidebarLink to="/departments" icon={Building2} title="Departments" />
          <SidebarLink to="/projects" icon={LayoutGrid} title="Projects" />
          <SidebarLink to="/requests" icon={FileText} title="Requests" />
          <SidebarLink to="/help" icon={HelpCircle} title="Help" />
          <SidebarLink to="/profile" icon={User} title="Profile" />
        </div>
        <div className="mt-auto">
          {user?.role === 'admin' && (
            <SidebarLink to="/admin/settings" icon={Settings} title="Admin" />
          )}
          
          {/* Logout button */}
          <div 
            className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer text-white/80 hover:bg-white/15 hover:text-white transition-all mt-2"
            onClick={handleLogout}
          >
            <div className="flex items-center justify-center w-6 h-6">
              <LogOut className="h-5 w-5" />
            </div>
            <span className={cn(
              "font-medium",
              !isOpen && "hidden"
            )}>Logout</span>
          </div>
        </div>
        <div 
          className={cn(
            "flex items-center gap-x-2 px-3 py-2 text-white/70 mt-4 border-t border-white/10 pt-4", 
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
