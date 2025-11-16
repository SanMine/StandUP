import React from 'react';
import AppBar from './AppBar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = ({ children, user }) => {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser || null;

  return (
    <div className="min-h-screen bg-[#FFFDFA]">
      <AppBar user={currentUser} />
      <Sidebar user={currentUser} />
      <main className="ml-64 mt-16 p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
