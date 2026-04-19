import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useSettings } from '../../context/SettingsContext';
import Modal from '../UI/Modal';
import ConfirmDialog from '../UI/ConfirmDialog';
import { Trash2, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalaryModal({ isOpen, onClose }) {
  const { salary, addSalary, updateSalary, deleteSalary } = useApp();
  const { settings, updateSettings, formatCurrency } = useSettings();
  const [form, setForm] = useState({ amount: '', month: '', year: '' });
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const currentSalary = salary[0]; // most recent salary entry
  const now = new Date();

  useEffect(() => {
    if (isOpen) {
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
    if (!form.amount && budget === '') return;

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
        const parsedBudget = parseFloat(budget);
        if (!isNaN(parsedBudget)) {
          await updateSettings({ monthlyBudget: parsedBudget });
        }
      }

      toast.success("Settings updated successfully!");
      onClose();
    } catch (err) {
      console.error('Save salary/budget failed:', err);
      toast.error("Failed to save changes.");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSalary(id);
      toast.success("Salary entry deleted.");
    } catch (err) {
      console.error('Delete salary failed:', err);
      toast.error("Failed to delete entry.");
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const suggestedBudget = form.amount ? (parseFloat(form.amount) * 0.8) : null;

  return (
    <>
      {/* We apply a hidden title in the base Modal component, and override the internal wrapper with our custom styles. */}
      {/* Since the base Modal is bg-white, we inject negative margins to overlap it exactly if possible, or visually box it well. */}
      <Modal isOpen={isOpen} onClose={onClose} title=" " size="md">
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative border border-slate-700/60 -mx-4 -my-4 sm:-mx-6 sm:-my-6 p-4 sm:p-6 mb-0">
          
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <TrendingUp size={120} className="text-emerald-500" />
          </div>

          <div className="mb-6 relative z-10">
             <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp size={18} />
                </div>
                Financial Planning
             </h2>
             <p className="text-sm text-slate-400 mt-1">Manage your active income and monthly budgets safely.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Salary Section */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Monthly Salary ({settings.currency})</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 font-semibold">{settings.currency}</div>
                    <input
                        type="number"
                        className="w-full bg-slate-900 border border-slate-700 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white rounded-lg pl-8 pr-3 py-2.5 text-lg"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                        min="0"
                        required
                    />
                </div>
                {suggestedBudget !== null && !isNaN(suggestedBudget) && suggestedBudget > 0 && (
                    <div className="mt-2.5 flex items-start gap-2 bg-emerald-500/10 text-emerald-400 p-2 rounded-lg text-sm font-medium animate-fade-in border border-emerald-500/20">
                        <Sparkles size={16} className="shrink-0 mt-0.5" />
                        <div>
                           <span>Suggested Budget (80%): {formatCurrency(suggestedBudget)}</span>
                           <p className="text-[10px] text-emerald-500/80 font-normal leading-tight mt-0.5">Automatically calculates 80% to enforce safe 20% saving margins natively.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Month</label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white rounded-lg px-3 py-2.5"
                  value={form.month}
                  onChange={e => setForm(p => ({ ...p, month: e.target.value }))}
                >
                  {months.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Year</label>
                <input
                  type="number"
                  className="w-full bg-slate-800 border border-slate-700 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white rounded-lg px-3 py-2.5"
                  value={form.year}
                  onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                  min="2020"
                  max="2030"
                />
              </div>
            </div>

            {/* Budget Section */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50 text-slate-100">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Target Monthly Budget</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        className="w-full bg-slate-900 border border-slate-700 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-white rounded-lg px-3 py-2"
                        placeholder="e.g. 12000"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        min="0"
                    />
                     <button type="button" onClick={() => { if(suggestedBudget) setBudget(suggestedBudget.toString()) }} className="bg-slate-700 hover:bg-emerald-600/90 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap border border-slate-600">Use 80%</button>
                </div>
                <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-slate-500 leadings-tight">
                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                    <span>Your dashboard will immediately transition to a warning state when expenses exceed 80% of this budget.</span>
                </div>
            </div>

            {/* Past entries mini-cards */}
            {salary.length > 0 && (
              <div className="pt-2">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">Recent Salary Records</p>
                <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1 stylish-scroll">
                  {salary.map(s => (
                    <div key={s.id} className="group flex items-center justify-between bg-slate-800 border border-slate-700/60 rounded-xl pl-4 pr-2 py-2.5 hover:border-slate-600 transition-colors shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-slate-100 leading-tight">{formatCurrency(s.amount)}</span>
                        <span className="text-[11px] uppercase tracking-wider text-emerald-500/80 font-medium">
                          {months[s.month - 1]} {s.year}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(s.id)}
                        className="p-2 bg-slate-700/50 rounded-lg text-slate-400 opacity-80 group-hover:opacity-100 hover:text-white hover:bg-red-500/80 transition-all shadow-[0_2px_10px_rgba(239,68,68,0)] hover:shadow-[0_2px_10px_rgba(239,68,68,0.4)]"
                        title="Delete Record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 justify-end">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 hover:text-white transition-colors">Close</button>
              <button type="submit" className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] transition-all transform hover:-translate-y-px" disabled={saving}>
                {saving ? 'Saving...' : currentSalary ? 'Commit Changes' : 'Initialize Plan'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        title="Delete Record"
        message="This removes the historical salary record. Dashboard balances will heavily recalculate instantly."
      />

       <style>{`
          .stylish-scroll::-webkit-scrollbar {
             width: 4px;
          }
          .stylish-scroll::-webkit-scrollbar-track {
             background: #1e293b;
             border-radius: 4px;
          }
          .stylish-scroll::-webkit-scrollbar-thumb {
             background: #334155;
             border-radius: 4px;
          }
          .stylish-scroll::-webkit-scrollbar-thumb:hover {
             background: #475569;
          }
       `}</style>
    </>
  );
}
