import { NavLink } from 'react-router-dom';
import { Map, AlertCircle, LayoutDashboard, Bot, User, Shield, ChevronRight, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import useAppStore from '../../store/useAppStore';
import logoImg from '../../assets/logo.png';

const navItems = [
  { to: '/map',       icon: Map,             label: 'Map'       },
  { to: '/complaint', icon: AlertCircle,     label: 'Complaint' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ai',        icon: Bot,             label: 'AI Assistant' },
  { to: '/account',   icon: User,            label: 'Account'   },
];

export default function TopNav() {
  const { currentUser, darkMode, toggleDarkMode } = useAppStore();

  return (
    <nav className="hidden md:block sticky top-0 z-50 w-full bg-bg-surface/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <NavLink to="/map" className="flex items-center gap-2 select-none group">
          <img src={logoImg} alt="RoadWatch Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
          <span className="font-bold text-lg tracking-tight text-text-main">
            Road<span className="text-primary">Watch</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className="relative group">
              {({ isActive }) => (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-primary/5 rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 hover:text-primary transition-colors cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-primary-light"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
          </motion.button>

          <NavLink to="/account" className="flex items-center gap-3 pl-4 border-l border-border-subtle group">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-semibold text-text-main">{currentUser.name}</p>
              <p className="text-[10px] font-medium text-text-muted">Mumbai Resident</p>
            </div>
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-primary text-white font-bold text-sm shadow-sm border-2 border-bg-surface"
              >
                {currentUser.name.charAt(0)}
              </motion.div>
            </div>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
