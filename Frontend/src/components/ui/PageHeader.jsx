export default function PageHeader({ title, subtitle, className = '' }) {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-3xl font-bold text-text-main mb-2 tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm font-medium text-text-muted max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
