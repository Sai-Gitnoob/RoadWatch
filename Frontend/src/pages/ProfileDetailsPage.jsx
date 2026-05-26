import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Calendar, Loader2, Fingerprint } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { authService } from '../services/authService';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, PageHeader } from '../components/ui';

const fields = [
  { label: 'User ID', key: 'uid', icon: Fingerprint },
  { label: 'Full Name', key: 'name', icon: User },
  { label: 'Email Address', key: 'email', icon: Mail },
  { label: 'Date of Birth', key: 'dob', icon: Calendar },
];

export default function ProfileDetailsPage() {
  const { token } = useAppStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile(token);
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  return (
    <PageContainer className="!max-w-2xl mx-auto">
      {/* Back button */}
      <motion.button
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/account')}
        className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-2"
      >
        <ArrowLeft size={16} />
        Back to Account
      </motion.button>

      <PageHeader
        title="Profile Information"
        subtitle="Your personal details collected during sign up"
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center" hover={false}>
          <p className="text-sm font-medium text-danger">{error}</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden" hover={false}>
          <div className="divide-y divide-border-subtle">
            {fields.map(({ label, key, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-text-muted">{label}</span>
                </div>
                <span className="text-sm font-bold text-text-main">
                  {key === 'uid' ? (profile?.[key] || useAppStore.getState().currentUser?.uid || 'Not provided') : (profile?.[key] || 'Not provided')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
