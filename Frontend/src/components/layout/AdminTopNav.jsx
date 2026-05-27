import { NavLink } from 'react-router-dom';
import { AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import useAppStore from '../../store/useAppStore';
import logoImg from '../../assets/logo.png';

const adminNavItems = [
  { to: '/admin',          icon: AlertCircle, label: 'Active Complaints' },
  { to: '/admin/resolved', icon: CheckCircle, label: 'Resolved' },
  { to: '/admin/stats',    icon: BarChart3,   label: 'Statistics' },
];

export default function AdminTopNav() {
  const { currentUser, logout } = useAppStore();

  return (
    <nav className="hidden md:block sticky top-0 z-50 w-full bg-bg-surface/90 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <NavLink to="/admin" className="flex items-center gap-2 select-none group">
          <img src={logoImg} alt="RoadWatch Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
          <span className="font-bold text-lg tracking-tight text-text-main">
            Road<span className="text-primary">Watch</span>
            <span className="ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-danger/10 text-danger border border-danger/20">Admin</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-1">
          {adminNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className="relative group" end={to === '/admin'}>
              {({ isActive }) => (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="admin-nav-pill"
                      className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right pl-4 border-l border-border-subtle">
            <p className="text-xs font-semibold text-text-main">{currentUser?.name || 'Admin'}</p>
            <button onClick={logout} className="text-[10px] font-bold text-danger hover:underline uppercase">Logout</button>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-danger/20 text-danger font-bold text-sm shadow-sm border border-danger/30">
            A
          </div>
        </div>
      </div>
    </nav>
  );
}
