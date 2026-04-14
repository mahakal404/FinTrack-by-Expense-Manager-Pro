import { SearchX, Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">
        {title || 'No data found'}
      </h3>
      <p className="text-sm text-slate-500 text-center max-w-xs mb-4">
        {message || 'Try adjusting your filters or search term'}
      </p>
      {action && action}
    </div>
  );
}
