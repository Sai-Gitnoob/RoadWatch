import React from 'react';
import { Navigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import TopNav from '../layout/TopNav';
import BottomNav from '../layout/BottomNav';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, token, currentUser } = useAppStore();
  
  // For testing, bypass authentication check
  /*
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
<<<<<<< HEAD
  */
=======

  if (currentUser && currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
>>>>>>> 2d8e85987b77b2aa276cd432e2af63d76fb19ff2
  
  return (
    <div className="w-full max-w-6xl min-h-screen bg-bg-base flex flex-col relative">
      <TopNav />
      <main className="flex-1 w-full pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
