import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  const darkMode = useAppStore((state) => state.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div className="bg-bg-base min-h-screen w-full flex justify-center overflow-x-hidden">
        <div className="w-full max-w-6xl min-h-screen bg-bg-base flex flex-col relative">
          <TopNav />
          <Toast />
          <main className="flex-1 w-full pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Navigate to="/map" replace />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/complaint" element={<ComplaintPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/complaint/:id" element={<ComplaintDetailPage />} />
              <Route path="/ai" element={<AIAssistantPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </div>
    </BrowserRouter>
  );
}
