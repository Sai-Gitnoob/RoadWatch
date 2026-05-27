import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Bell, Settings, LogOut,
  ChevronRight, Clock, CheckCircle, FileText, MapPin, Award, Sun, Moon, Fingerprint
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, StatCard, PageHeader, SectionHeader, StatusBadge } from '../components/ui';

export default function AccountPage() {
  const { currentUser, complaints, setNotification, darkMode, toggleDarkMode, logout } = useAppStore();
  const navigate = useNavigate();

  const userComplaints = currentUser ? complaints.filter(c => c.userId === currentUser.uid) : [];
  const resolvedCount = userComplaints.filter(c => c.status === 'resolved').length;

  const settingsOptions = [
    { label: 'Profile Information', icon: User, desc: 'View your personal details and preferences', action: () => navigate('/profile') },
    { label: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: darkMode ? Sun : Moon, desc: darkMode ? 'Currently using Dark Theme' : 'Currently using Light Theme', action: toggleDarkMode },
  ];

  return (
    <PageContainer className="!max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="relative group mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-md border-4 border-white"
          >
            {currentUser?.name?.charAt(0) || 'U'}
          </motion.div>
          <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-success border-2 border-white shadow-sm" />
        </div>

        <PageHeader
          title={currentUser?.name || 'User'}
          subtitle="Verified Mumbai Resident • Active Contributor"
          className="mb-0 items-center text-center"
        />
        <p className="text-sm font-medium text-text-muted mt-2">
          UID: <span className="font-bold text-text-main">{currentUser?.uid || 'N/A'}</span>
        </p>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Settings List */}
        <div className="space-y-6">
          <SectionHeader title="Account Settings" />
          <Card className="p-0 overflow-hidden" hover={false}>
            <div className="divide-y divide-border-subtle">
              {settingsOptions.map((opt, i) => (
                <button key={i} onClick={opt.action} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-standard">
                      <opt.icon size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-text-main">{opt.label}</p>
                      <p className="text-[11px] text-text-muted font-medium">{opt.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </Card>

          <button
            onClick={() => {
              setNotification({ type: 'info', message: 'Logging out...' });
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border font-bold text-sm transition-all shadow-sm"
            style={{ backgroundColor: '#ff6666', color: '#fff', borderColor: '#ff6666' }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Submissions List */}
        <div className="space-y-6">
          <SectionHeader title="Recent Submissions" />
          <div className="space-y-3">
            {userComplaints.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/50" hover={false}>
                <p className="text-sm font-medium text-text-muted italic">No reports filed yet.</p>
              </Card>
            ) : (
              userComplaints.slice(0, 4).map((c, i) => (
                <Card key={i} className="p-4 flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/dashboard/complaint/${c.id}`)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-standard">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-main truncate max-w-[150px] group-hover:text-primary transition-colors">{c.issueType}</p>
                      <div className="flex items-center gap-1 opacity-50">
                        <MapPin size={10} />
                        <p className="text-[10px] font-medium truncate max-w-[120px]">{c.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={c.status} />
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-all" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
