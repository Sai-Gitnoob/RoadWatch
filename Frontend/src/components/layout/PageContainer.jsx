export function PageContainer({ children, className = '' }) {
  return (
    <div className={`max-w-6xl mx-auto px-6 lg:px-12 py-8 space-y-8 ${className}`}>
      {children}
    </div>
  );
}

export function NarrowContainer({ children, className = '' }) {
  return (
    <div className={`max-w-3xl mx-auto px-6 lg:px-8 py-8 space-y-8 ${className}`}>
      {children}
    </div>
  );
}
