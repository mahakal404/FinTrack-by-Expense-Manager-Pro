import Card from './Card';

export default function StatCard({ icon: Icon, label, value, subtitle, accentColor = 'primary', className = '' }) {
  const colors = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      value: 'text-primary-700',
    },
    success: {
      bg: 'bg-success-50',
      icon: 'text-success-600',
      value: 'text-success-700',
    },
    danger: {
      bg: 'bg-danger-50',
      icon: 'text-danger-500',
      value: 'text-danger-600',
    },
    teal: {
      bg: 'bg-teal-50',
      icon: 'text-teal-600',
      value: 'text-teal-600',
    },
    warning: {
      bg: 'bg-warning-50',
      icon: 'text-warning-600',
      value: 'text-warning-600',
    },
  };

  const c = colors[accentColor] || colors.primary;

  return (
    <Card hover className={`p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
          <p className={`text-xl font-bold ${c.value}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs mt-1 ${c.icon}`}>{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={c.icon} />
          </div>
        )}
      </div>
    </Card>
  );
}
