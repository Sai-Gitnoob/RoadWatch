export default function RadioGroup({ options, value, onChange, className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center justify-between gap-3 rounded-xl border-2 text-left transition-standard relative overflow-hidden group
            ${value === opt.value ? 'bg-bg-base/30' : 'bg-bg-surface border-border-subtle hover:bg-bg-base/20'}`}
          style={{ 
            padding: '12px',
            borderLeftColor: value === opt.value ? opt.color : 'transparent', 
            borderLeftWidth: '4px' 
          }}
        >
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: value === opt.value ? opt.color : 'var(--color-text-main)' }}>{opt.label}</p>
            <p className="text-[9px] text-text-muted font-bold mt-0.5">{opt.desc}</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 p-0.5 flex items-center justify-center transition-colors flex-shrink-0 ${value === opt.value ? 'border-primary' : 'border-border-subtle'}`}>
            {value === opt.value && <div className="w-full h-full rounded-full bg-primary" />}
          </div>
        </button>
      ))}
    </div>
  );
}
