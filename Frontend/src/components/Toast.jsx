import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const icons = {
  success: <CheckCircle size={20} className="text-success" />,
  error:   <XCircle size={20} className="text-danger" />,
  warning: <AlertCircle size={20} className="text-warning" />,
  info:    <Info size={20} className="text-info" />,
};

export default function Toast() {
  const notification = useAppStore((s) => s.notification);
  const setNotification = useAppStore((s) => s.setNotification);

  const type = notification?.type || 'info';

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[200] flex items-center gap-4 px-6 py-4 rounded-[2rem] shadow-lg bg-white/80 backdrop-blur-xl border border-border-subtle min-w-[280px] max-w-[90vw]"
        >
          <div className={`p-2 rounded-xl bg-bg-base`}>
            {icons[type]}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-0.5">System Alert</p>
            <p className="text-sm font-black text-text-main truncate">{notification.message}</p>
          </div>

          <button 
            onClick={() => setNotification(null)} 
            className="p-1.5 rounded-full hover:bg-bg-base text-text-muted transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
