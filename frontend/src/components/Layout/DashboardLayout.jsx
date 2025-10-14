import React from 'react';
import AppBar from './AppBar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, user }) => {
  return (
    <div className="min-h-screen bg-[#FFFDFA]">
      <AppBar user={user} />
      <Sidebar />
      <main className="ml-64 mt-16 p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
