import { motion, AnimatePresence } from 'framer-motion';

export default function FormField({ label, error, children, icon: Icon, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
          {Icon && <Icon size={12} className="text-primary" />} {label}
        </label>
      )}
      {children}
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="text-[10px] text-danger font-black uppercase tracking-widest"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
