import { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import { RenderIcon } from '../../utils/icons';

const ICONS = ['Target', 'Plane', 'Home', 'Car', 'Monitor', 'Gift', 'GraduationCap', 'Activity', 'Music', 'Gamepad2', 'Zap', 'Briefcase', 'Coffee', 'ShoppingBag', 'Dog'];

export default function GoalForm({ isOpen, onClose, onSubmit, editData = null }) {
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    icon: 'Target',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        targetAmount: editData.targetAmount?.toString() || '',
        currentAmount: editData.currentAmount?.toString() || '',
        icon: editData.icon || 'Target',
      });
    } else {
      setForm({ title: '', targetAmount: '', currentAmount: '', icon: 'Target' });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetAmount) return;

    setSaving(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount) || 0,
        icon: form.icon,
      });
      onClose();
    } catch (err) {
      console.error('Save goal failed:', err);
    }
    setSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Goal' : 'New Savings Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Goal Title</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Vacation Fund"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Target Amount (₹)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 100000"
              value={form.targetAmount}
              onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))}
              min="1"
              required
            />
          </div>
          <div>
            <label className="label">Saved So Far (₹)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 25000"
              value={form.currentAmount}
              onChange={e => setForm(p => ({ ...p, currentAmount: e.target.value }))}
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="label">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm(p => ({ ...p, icon }))}
                className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all
                  ${form.icon === icon
                    ? 'bg-primary-100 ring-2 ring-primary-400 scale-110 text-primary-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
                  }`}
              >
                <RenderIcon name={icon} size={20} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2 justify-end border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : editData ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
