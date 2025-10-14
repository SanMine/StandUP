import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  GraduationCap, 
  FolderOpen, 
  Video, 
  FileText, 
  Settings 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase, label: 'Jobs', path: '/jobs' },
  { icon: Users, label: 'Mentors', path: '/mentors' },
  { icon: GraduationCap, label: 'Learning', path: '/learning' },
  { icon: FolderOpen, label: 'Portfolio', path: '/portfolio' },
  { icon: Video, label: 'Interviews', path: '/interviews' },
  { icon: FileText, label: 'Applications', path: '/applications' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-[#FFE4CC] text-[#FF7000] font-medium shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive ? "text-[#FF7000]" : "text-gray-500"
              )} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
