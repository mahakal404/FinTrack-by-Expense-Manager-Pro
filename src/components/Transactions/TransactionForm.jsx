import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useFirestore } from '../../hooks/useFirestore';
import Modal from '../UI/Modal';
import { Paperclip, Upload, ChevronDown, Plus } from 'lucide-react';
import { RenderIcon } from '../../utils/icons';
import CategoryManager from '../Categories/CategoryManager';

export default function TransactionForm({ isOpen, onClose, editData = null }) {
  const { categories } = useApp();
  const { uploadFile } = useFirestore('expenses');
  const { addExpense, updateExpense } = useApp();
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'food',
    note: '',
    receiptUrl: '',
  });

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        amount: editData.amount?.toString() || '',
        date: editData.date || new Date().toISOString().split('T')[0],
        category: editData.category || 'food',
        note: editData.note || '',
        receiptUrl: editData.receiptUrl || '',
      });
    } else {
      setForm({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: categories.length > 0 ? categories[0].id : 'food',
        note: '',
        receiptUrl: '',
      });
    }
  }, [editData, isOpen, categories]);

  // Handle outside click for custom dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setForm(prev => ({ ...prev, receiptUrl: url }));
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;

    setSaving(true);
    try {
      const data = {
        ...form,
        amount: parseFloat(form.amount),
        // If they pick a category that got deleted, default to first available
        category: categories.find(c => c.id === form.category) ? form.category : categories[0].id,
      };

      if (editData) {
        await updateExpense(editData.id, data);
      } else {
        await addExpense(data);
      }
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
    }
    setSaving(false);
  };

  const setDateShortcut = (daysToAdd) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    setForm(p => ({ ...p, date: d.toISOString().split('T')[0] }));
  };

  const selectedCat = categories.find(c => c.id === form.category);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Transaction' : 'Add Transaction'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Grocery shopping"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (₹)</label>
              <input
                type="number"
                className="input"
                placeholder="e.g. 250"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="relative" ref={dropdownRef}>
              <label className="label">Category</label>
              
              {/* Custom Select Box */}
              <div 
                className="input flex items-center justify-between cursor-pointer bg-white"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {selectedCat ? (
                  <div className="flex items-center gap-2 overflow-hidden">
                    <RenderIcon name={selectedCat.icon} size={16} className="text-slate-500 shrink-0" />
                    <span className="truncate text-slate-700 font-medium text-sm">{selectedCat.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400">Select...</span>
                )}
                <ChevronDown size={14} className="text-slate-400 shrink-0" />
              </div>

              {/* Custom Dropdown Options */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
                  <div className="p-1">
                    {categories.map(c => (
                      <div
                        key={c.id}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors
                          ${form.category === c.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}
                        `}
                        onClick={() => {
                          setForm(p => ({ ...p, category: c.id }));
                          setShowDropdown(false);
                        }}
                      >
                        <RenderIcon name={c.icon} size={16} style={{ color: form.category === c.id ? undefined : c.color }} className={form.category === c.id ? 'text-primary-600' : ''} />
                        <span className="truncate">{c.name}</span>
                      </div>
                    ))}

                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    
                    <div
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg cursor-pointer text-primary-600 hover:bg-primary-50 transition-colors"
                      onClick={() => {
                        setShowDropdown(false);
                        setShowCategoryManager(true);
                      }}
                    >
                      <Plus size={16} />
                      <span className="font-semibold">Add Custom Category</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Date</label>
                <div className="flex gap-2 text-[10px]">
                  <button type="button" onClick={() => setDateShortcut(-1)} className="text-primary-600 hover:text-primary-700 font-medium focus:outline-none">Yesterday</button>
                  <button type="button" onClick={() => setDateShortcut(0)} className="text-primary-600 hover:text-primary-700 font-medium focus:outline-none">Today</button>
                </div>
              </div>
              <input
                type="date"
                min="2000-01-01"
                max="2099-12-31"
                className="input"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Note (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. chai + snacks"
                value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label">Receipt (optional)</label>
            <div className="flex items-center gap-3">
              <label className="btn btn-outline btn-sm cursor-pointer border-slate-200">
                <Upload size={14} />
                {uploading ? 'Processing...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              {form.receiptUrl && (
                <span className="flex items-center gap-1.5 text-xs text-success-600 bg-success-50 px-2.5 py-1 rounded-full border border-success-100">
                  <Paperclip size={12} />
                  Attached successfully
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-3 justify-end border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editData ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Internal manager rendered conditionally */}
      {showCategoryManager && (
        <CategoryManager
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </>
  );
}
