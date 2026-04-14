export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-card border border-slate-100
        ${hover ? 'transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
