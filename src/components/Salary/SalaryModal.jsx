import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../UI/Modal';
import ConfirmDialog from '../UI/ConfirmDialog';
import { Trash2 } from 'lucide-react';

export default function SalaryModal({ isOpen, onClose }) {
  const { salary, addSalary, updateSalary, deleteSalary, settings, updateSettings } = useApp();
  const [form, setForm] = useState({ amount: '', month: '', year: '' });
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const currentSalary = salary[0]; // most recent salary entry

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      if (currentSalary) {
        setForm({
          amount: currentSalary.amount?.toString() || '',
          month: currentSalary.month?.toString() || (now.getMonth() + 1).toString(),
          year: currentSalary.year?.toString() || now.getFullYear().toString(),
        });
      } else {
        setForm({
          amount: '',
          month: (now.getMonth() + 1).toString(),
          year: now.getFullYear().toString(),
        });
      }
      setBudget(settings.monthlyBudget?.toString() || '');
    }
  }, [isOpen, currentSalary, settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount && !budget) return;

    setSaving(true);
    try {
      if (form.amount) {
        const data = {
          amount: parseFloat(form.amount),
          month: parseInt(form.month),
          year: parseInt(form.year),
        };

        if (currentSalary) {
          await updateSalary(currentSalary.id, data);
        } else {
          await addSalary(data);
        }
      }

      if (budget !== '') {
        await updateSettings({ monthlyBudget: parseFloat(budget) || 0 });
      }

      onClose();
    } catch (err) {
      console.error('Save salary/budget failed:', err);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSalary(id);
    } catch (err) {
      console.error('Delete salary failed:', err);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Set Monthly Salary">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Monthly Salary (₹)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 50000"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              min="0"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Update anytime — your balance recalculates instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Month</label>
              <select
                className="input"
                value={form.month}
                onChange={e => setForm(p => ({ ...p, month: e.target.value }))}
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input
                type="number"
                className="input"
                value={form.year}
                onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                min="2020"
                max="2030"
              />
            </div>
          </div>

          <div>
            <label className="label">Monthly Budget (₹)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 12000"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              min="0"
            />
            <p className="text-xs text-slate-400 mt-1">
              Set a budget to get spending warnings at 80%.
            </p>
          </div>

          {/* Past entries */}
          {salary.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Recent salary entries</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {salary.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-sm font-medium text-slate-700">₹{s.amount?.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 ml-2">
                        {months[s.month - 1]} {s.year}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(s.id)}
                      className="p-1.5 text-slate-400 hover:text-danger-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2 justify-end border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : currentSalary ? 'Update Salary' : 'Set Salary'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        title="Delete Salary Entry"
        message="This will remove the salary record. Your balance will be recalculated."
      />
    </>
  );
}
