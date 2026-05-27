import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopNav from './components/layout/TopNav';
import BottomNav from './components/layout/BottomNav';
import useAppStore from './store/useAppStore';
import Toast from './components/Toast';
import MapPage from './pages/MapPage';
import ComplaintPage from './pages/ComplaintPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AccountPage from './pages/AccountPage';
import ProfileDetailsPage from './pages/ProfileDetailsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/Auth/SignUp';
import { authService } from './services/authService';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, token } = useAppStore();
  
  if (isAuthenticated || token) {
    return <Navigate to="/map" replace />;
  }
  
  return children;
};

export default function App() {
  const { darkMode, token, currentUser, setCurrentUser, logout } = useAppStore();
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const checkAuth = async () => {
      if (token && !currentUser) {
        try {
          const data = await authService.getProfile(token);
          setCurrentUser(data);
          await useAppStore.getState().fetchComplaints();
        } catch (error) {
          console.error("Auth validation failed:", error);
          logout();
        }
      }
      setAuthChecking(false);
    };
    checkAuth();
  }, [token, currentUser, setCurrentUser, logout]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="bg-bg-base min-h-screen w-full flex justify-center overflow-x-hidden">
        <Toast />
        <Routes>
          <Route path="/" element={<Navigate to="/map" replace />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          
          {/* Protected Routes */}
          <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/complaint" element={<ProtectedRoute><ComplaintPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/complaint/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileDetailsPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </HashRouter>
  );
}
