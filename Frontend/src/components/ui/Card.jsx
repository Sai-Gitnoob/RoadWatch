import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2, shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
      className={`bg-bg-surface border border-border-subtle rounded-2xl shadow-sm transition-standard ${hover ? 'hover:shadow-md' : ''} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.div>
  );
}
