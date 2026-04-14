export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercent = true,
  size = 'md',
  className = ''
}) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const getColor = () => {
    if (percent >= 80) return 'bg-danger-500';
    if (percent >= 60) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getTrackColor = () => {
    if (percent >= 80) return 'bg-danger-50';
    if (percent >= 60) return 'bg-warning-50';
    return 'bg-success-50';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
          {showPercent && (
            <span className={`text-xs font-bold ${percent >= 80 ? 'text-danger-600' : percent >= 60 ? 'text-warning-600' : 'text-success-600'}`}>
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${heights[size]} ${getTrackColor()} rounded-full overflow-hidden`}>
        <div
          className={`${heights[size]} ${getColor()} rounded-full transition-all duration-700 ease-out animate-progress`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
