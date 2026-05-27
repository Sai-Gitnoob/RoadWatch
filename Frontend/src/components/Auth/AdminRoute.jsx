import React from 'react';
import { Navigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';

import AdminTopNav from '../layout/AdminTopNav';
import AdminBottomNav from '../layout/AdminBottomNav';

export default function AdminRoute({ children }) {
  const { isAuthenticated, token, currentUser } = useAppStore();
  
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  // Ensure only admins can access
  if (currentUser && currentUser.role !== 'admin') {
    return <Navigate to="/map" replace />;
  }
  
  return (
    <div className="dark bg-bg-base text-text-main min-h-screen w-full flex flex-col relative">
      <AdminTopNav />
      <main className="flex-1 w-full pb-20 md:pb-0">
        {children}
      </main>
      <AdminBottomNav />
    </div>
  );
}
