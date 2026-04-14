import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../UI/Modal';
import ConfirmDialog from '../UI/ConfirmDialog';
import { Trash2, Plus } from 'lucide-react';
import { RenderIcon, ICON_NAMES } from '../../utils/icons';

/* ── Each icon preset now has its own vibrant default color ── */
const ICON_PRESETS = [
  { id: 'ShoppingBag', label: 'Shopping', color: '#f59e0b' },
  { id: 'Car', label: 'Transport', color: '#3b82f6' },
  { id: 'Coffee', label: 'Coffee', color: '#92400e' },
  { id: 'Gamepad2', label: 'Gaming', color: '#8b5cf6' },
  { id: 'GraduationCap', label: 'Education', color: '#0ea5e9' },
  { id: 'Shirt', label: 'Clothing', color: '#ec4899' },
  { id: 'User', label: 'Personal', color: '#6366f1' },
  { id: 'Music', label: 'Music', color: '#a855f7' },
  { id: 'Activity', label: 'Fitness', color: '#10b981' },
  { id: 'Dog', label: 'Pets', color: '#f97316' },
  { id: 'Zap', label: 'Utilities', color: '#eab308' },
  { id: 'Gift', label: 'Gifts', color: '#ef4444' },
  { id: 'Wine', label: 'Drinks', color: '#be123c' },
  { id: 'Monitor', label: 'Tech', color: '#0284c7' },
  { id: 'Baby', label: 'Kids', color: '#fb7185' },
  { id: 'HeartPulse', label: 'Medical', color: '#ef4444' },
  { id: 'Film', label: 'Movies', color: '#7c3aed' },
  { id: 'ShoppingCart', label: 'Grocery', color: '#22c55e' },
  { id: 'Bike', label: 'Cycling', color: '#14b8a6' },
  { id: 'Utensils', label: 'Dining', color: '#f97316' },
  { id: 'Smartphone', label: 'Recharge', color: '#06b6d4' },
  { id: 'Wifi', label: 'Internet', color: '#3b82f6' },
  { id: 'CreditCard', label: 'Banking', color: '#8b5cf6' },
  { id: 'Fuel', label: 'Fuel', color: '#ea580c' },
  { id: 'BookOpen', label: 'Books', color: '#0d9488' },
  { id: 'Dumbbell', label: 'Gym', color: '#dc2626' },
  { id: 'Plane', label: 'Travel', color: '#0ea5e9' },
  { id: 'Home', label: 'Home', color: '#8b5cf6' },
  { id: 'Briefcase', label: 'Work', color: '#475569' },
  { id: 'Landmark', label: 'EMI/Loan', color: '#b45309' },
];

/* ── Vibrant color palette for the color picker ── */
const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  '#ea580c', '#b45309', '#0d9488', '#0284c7',
  '#7c3aed', '#be123c', '#dc2626', '#475569',
];

export default function CategoryManager({ isOpen, onClose }) {
  const { categories, customCategories, addCategory, deleteCategory } = useApp();

  const [newCat, setNewCat] = useState({
    name: '',
    icon: 'ShoppingBag',
    color: '#f59e0b',
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* When user picks an icon, auto-assign its preset color */
  const handleIconSelect = (preset) => {
    setNewCat(p => ({ ...p, icon: preset.id, color: preset.color }));
  };

  const handleAdd = async () => {
    if (!newCat.name.trim()) return;
    setSaving(true);
    try {
      await addCategory({
        name: newCat.name.trim(),
        icon: newCat.icon,
        color: newCat.color,
        isDefault: false,
      });
      setNewCat({ name: '', icon: 'ShoppingBag', color: '#f59e0b' });
    } catch (err) {
      console.error('Add category failed:', err);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
    } catch (err) {
      console.error('Delete category failed:', err);
    }
  };

  const selectedPreset = ICON_PRESETS.find(p => p.id === newCat.icon);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories" size="lg">
        <div className="space-y-6">
          
          {/* Add new Category Section */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <RenderIcon name="Tag" size={16} className="text-slate-500" /> Add New Category
              </h3>
              <p className="text-xs text-slate-500 mt-1">Pick a colorful icon, choose a color, and name your category.</p>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                className="input bg-slate-50 border-transparent focus:bg-white flex-1"
                placeholder="Category name (e.g. Mobile Recharge)"
                value={newCat.name}
                onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))}
              />
              <button
                onClick={handleAdd}
                className="btn btn-primary px-4 rounded-xl flex-shrink-0"
                style={{ background: newCat.color }}
                disabled={saving || !newCat.name.trim()}
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Selected preview */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                style={{ background: newCat.color }}>
                <RenderIcon name={newCat.icon} size={14} />
                {selectedPreset?.label || newCat.icon}
              </div>
              <span className="text-[11px] text-slate-400">Selected icon & color</span>
            </div>

            {/* Icon Grid — colorful */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">Choose an icon:</label>
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-2">
                {ICON_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleIconSelect(preset)}
                    className={`cat-icon-btn ${newCat.icon === preset.id ? 'cat-icon-btn--active' : ''}`}
                  >
                    <div
                      className="cat-icon-circle"
                      style={{
                        background: newCat.icon === preset.id
                          ? preset.color
                          : `${preset.color}18`,
                        color: newCat.icon === preset.id ? 'white' : preset.color,
                      }}
                    >
                      <RenderIcon name={preset.id} size={18} />
                    </div>
                    <span className="text-[9px] font-medium leading-tight text-center truncate w-full px-0.5"
                      style={{ color: newCat.icon === preset.id ? preset.color : undefined }}
                    >
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 mb-2 block">Or pick a custom color:</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCat(p => ({ ...p, color: c }))}
                    className="cat-color-dot"
                    style={{
                      background: c,
                      boxShadow: newCat.color === c ? `0 0 0 3px ${c}40, 0 0 0 5px white` : 'none',
                      transform: newCat.color === c ? 'scale(1.25)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Custom Categories Section — now colorful! */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Your Custom Categories</h3>
            {customCategories.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {customCategories.map(cat => (
                  <div
                    key={cat.id}
                    className="flex flex-row items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${cat.color || '#64748b'}18` }}
                      >
                        <RenderIcon name={cat.icon} size={18} style={{ color: cat.color || '#64748b' }} />
                      </div>
                      <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => setConfirmDelete(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic px-2">No custom categories added yet.</p>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Default Categories Section */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Default Categories</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {categories.filter(c => c.isDefault).map(cat => (
                <div
                  key={cat.id}
                  className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 cursor-default"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5"
                    style={{ background: `${cat.color}18` }}
                  >
                    <RenderIcon name={cat.icon} size={20} style={{ color: cat.color }} />
                  </div>
                  <span className="text-xs font-medium text-slate-600 truncate max-w-full">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        title="Delete Category"
        message="Are you sure? Existing transactions using this category won't be deleted, but they will lose this category reference."
      />
    </>
  );
}
