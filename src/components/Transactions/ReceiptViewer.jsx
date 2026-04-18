import Modal from '../UI/Modal';
import { ExternalLink, Maximize2 } from 'lucide-react';

export default function ReceiptViewer({ url, isOpen, onClose }) {
  if (!url) return null;

  // Since Firebase Storage URLs can be tricky to parse just by extension when there are tokens,
  // we could rely on `.pdf` being in the URI path or we just check.
  // In our useFirestore.js we generate `${Date.now()}_...\.pdf` or `.jpg`.
  // So `.pdf` will be explicitly in the path before the query parameters.
  const isPdf = url.includes('.pdf');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt Viewer" size={isPdf ? 'xl' : 'lg'}>
      <div className="flex flex-col h-[70vh] bg-slate-50 mt-2 rounded-lg overflow-hidden relative">
        {isPdf ? (
          <div className="flex-1 w-full h-full flex flex-col">
            <div className="bg-slate-800 text-slate-200 p-3 flex justify-between items-center text-sm">
              <span>PDF Document</span>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                title="Open in new tab"
              >
                Open in new tab <ExternalLink size={14} />
              </a>
            </div>
            <iframe 
              src={url} 
              className="w-full h-full border-none flex-1" 
              title="PDF Receipt"
            />
          </div>
        ) : (
          <div className="flex-1 w-full h-full flex items-center justify-center p-4 bg-slate-900 overflow-auto">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all"
              title="Open Full Image"
            >
              <Maximize2 size={16} />
            </a>
            <img 
              src={url} 
              alt="Receipt" 
              className="max-w-full max-h-full object-contain rounded drop-shadow-lg"
            />
          </div>
        )}
      </div>
      <div className="flex justify-end p-4 border-t border-slate-200 bg-white">
        <button onClick={onClose} className="btn btn-outline">Close</button>
      </div>
    </Modal>
  );
}
