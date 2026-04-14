import { X, Download, ExternalLink } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, receiptUrl }) {
  if (!isOpen || !receiptUrl) return null;

  const isPdf = receiptUrl.toLowerCase().includes('.pdf');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-modal max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Receipt Preview</h3>
          <div className="flex items-center gap-2">
            <a
              href={receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm"
            >
              <ExternalLink size={14} />
              Open
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px]">
          {isPdf ? (
            <iframe
              src={receiptUrl}
              className="w-full h-[70vh] rounded-lg border border-slate-200"
              title="Receipt PDF"
            />
          ) : (
            <img
              src={receiptUrl}
              alt="Receipt"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}
