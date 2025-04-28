
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Users, Grid3X3, FolderKanban } from 'lucide-react';

const SidebarLink = ({
  to,
  icon: Icon,
  label,
  isActive,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    )}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { to: '/', icon: BarChart3, label: 'Dashboard' },
    { to: '/team', icon: Users, label: 'Team Members' },
    { to: '/departments', icon: Grid3X3, label: 'Departments' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
  ];

  return (
    <div className="hidden border-r bg-background lg:block">
      <div className="flex h-screen flex-col p-4">
        <div className="py-4">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Resource Nexus
          </h2>
        </div>
        <div className="space-y-1">
          {navItems.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={currentPath === item.to}
            />
          ))}
        </div>
        <div className="mt-auto">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-muted"></div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
