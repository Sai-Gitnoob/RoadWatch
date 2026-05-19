import Card from './Card';

export default function StatCard({ label, value, icon: Icon, status = 'primary', className = '' }) {
  const statusColors = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger:  'text-danger bg-danger/10',
    info:    'text-info bg-info/10',
  };

  return (
    <Card className={`p-6 flex flex-col items-center justify-center text-center gap-3 ${className}`}>
      <div className={`p-3 rounded-2xl transition-standard group-hover:scale-110 ${statusColors[status] || statusColors.primary}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <h3 className="text-3xl font-black text-text-main tracking-tight mb-1">{value}</h3>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</p>
      </div>
    </Card>
  );
}
