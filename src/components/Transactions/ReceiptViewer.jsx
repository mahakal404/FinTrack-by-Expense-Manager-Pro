import { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import { ExternalLink, Maximize2 } from 'lucide-react';
import db from '../../utils/db';

export default function ReceiptViewer({ url: storageKey, isOpen, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storageKey || !isOpen) return;
    
    let currentUrl = null;
    
    const loadReceipt = async () => {
      setLoading(true);
      try {
        const fileData = await db.getItem(storageKey);
        if (fileData) {
          currentUrl = URL.createObjectURL(fileData);
          setBlobUrl(currentUrl);
          setIsPdf(fileData.type === 'application/pdf' || fileData.name?.toLowerCase().endsWith('.pdf'));
        } else {
          setBlobUrl(null);
        }
      } catch (err) {
        console.error('[ReceiptViewer] Error loading from DB:', err);
        setBlobUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [storageKey, isOpen]);

  if (!storageKey) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt Viewer" size={isPdf ? 'xl' : 'lg'}>
      <div className="flex flex-col h-[70vh] bg-slate-50 mt-2 rounded-lg overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : blobUrl ? (
          isPdf ? (
            <div className="flex-1 w-full h-full flex flex-col">
              <div className="bg-slate-800 text-slate-200 p-3 flex justify-between items-center text-sm">
                <span>PDF Document</span>
                <a 
                  href={blobUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                  title="Open in new tab"
                >
                  Open in new tab <ExternalLink size={14} />
                </a>
              </div>
              <iframe 
                src={blobUrl} 
                className="w-full h-full border-none flex-1" 
                title="PDF Receipt"
              />
            </div>
          ) : (
            <div className="flex-1 w-full h-full flex items-center justify-center p-4 bg-slate-900 overflow-auto">
              <a 
                href={blobUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all"
                title="Open Full Image"
              >
                <Maximize2 size={16} />
              </a>
              <img 
                src={blobUrl} 
                alt="Receipt" 
                className="max-w-full max-h-full object-contain rounded drop-shadow-lg"
              />
            </div>
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
            <p className="text-sm font-medium">Receipt not found locally</p>
            <p className="text-[10px]">This may happen if the receipt was added on a different device.</p>
          </div>
        )}
      </div>
      <div className="flex justify-end p-4 border-t border-slate-200 bg-white">
        <button onClick={onClose} className="btn btn-outline">Close</button>
      </div>
    </Modal>
  );
}
