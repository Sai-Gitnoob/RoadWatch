import { NavLink } from 'react-router-dom';
import { Map, AlertCircle, LayoutDashboard, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/map',       icon: Map,             label: 'Map'       },
  { to: '/complaint', icon: AlertCircle,     label: 'Raise'     },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Board'     },
  { to: '/ai',        icon: Bot,             label: 'Assist'    },
  { to: '/account',   icon: User,            label: 'You'       },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border-subtle safe-area-pb">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className="relative flex flex-col items-center gap-1 min-w-[64px]">
            {({ isActive }) => (
              <>
                <div className={`p-2 transition-all ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}>
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                </div>
                <span className={`text-[10px] font-semibold transition-opacity ${isActive ? 'text-primary opacity-100' : 'opacity-60'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
