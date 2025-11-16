import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppBar from './AppBar';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Settings, Users, Calendar } from 'lucide-react';

const EmployerLayout = ({ children, user }) => {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser || null;
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/employer-dashboard',
      icon: LayoutDashboard
    },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Events', path: '/events', icon: Calendar },
    {
      name: 'Settings',
      path: '/employer-settings',
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDFA]">
      <AppBar user={currentUser} />

      {/* Employer Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                    ? 'bg-[#E8F0FF] text-[#284688] font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      <main className="p-8 mt-16 ml-64">
        {children}
      </main>
    </div>
  );
};

export default EmployerLayout;
