import { NavLink } from 'react-router-dom';
import { AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const adminNavItems = [
  { to: '/admin',          icon: AlertCircle, label: 'Active' },
  { to: '/admin/resolved', icon: CheckCircle, label: 'Resolved' },
  { to: '/admin/stats',    icon: BarChart3,   label: 'Stats' },
];

export default function AdminBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 bg-bg-surface/90 backdrop-blur-xl border-t border-border-subtle pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {adminNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className="relative flex flex-col items-center justify-center w-full h-full group"
          >
            {({ isActive }) => (
              <>
                <div className={`relative flex flex-col items-center gap-1 transition-colors
                  ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}>
                  
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide">
                    {label}
                  </span>
                </div>
                
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-indicator"
                    className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
