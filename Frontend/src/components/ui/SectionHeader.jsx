export default function SectionHeader({ title, className = '' }) {
  return (
    <div className={`flex items-center gap-4 mb-4 ${className}`}>
      <h2 className="text-sm font-semibold text-text-main whitespace-nowrap">{title}</h2>
      <div className="h-[1px] bg-border-subtle flex-1" />
    </div>
  );
}
