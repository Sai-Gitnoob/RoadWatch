export default function StatusBadge({ status, className = '' }) {
  const configs = {
    pending:    { label: 'Pending',    color: 'bg-warning/10 text-warning border-warning/20' },
    assigned:   { label: 'Assigned',   color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    inprogress: { label: 'Progress',   color: 'bg-primary/10 text-primary border-primary/20' },
    resolved:   { label: 'Resolved',   color: 'bg-success/10 text-success border-success/20' },
    critical:   { label: 'Critical',   color: 'bg-danger/10 text-danger border-danger/20' },
  };

  const statusKey = status?.toLowerCase().replace(/[-\s]+/g, '');
  const cfg = configs[statusKey] || configs.pending;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color} ${className}`}>
      {cfg.label}
    </span>
  );
}
