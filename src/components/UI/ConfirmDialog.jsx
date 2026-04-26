import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-modal w-full max-w-sm animate-scale-in p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-danger-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-danger-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{title || 'Confirm Delete'}</h3>
        </div>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="btn btn-danger font-bold"
          >
            {confirmText || 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
