import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import {
  Search, Plus, Filter, Edit3, Trash2, Paperclip,
  CheckSquare, Square, FileText, X
} from 'lucide-react';
import Card from '../components/UI/Card';
import EmptyState from '../components/UI/EmptyState';
import TransactionForm from '../components/Transactions/TransactionForm';
import ReceiptModal from '../components/Transactions/ReceiptModal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import { exportExpensesPDF } from '../utils/pdfExport';
import { RenderIcon } from '../utils/icons';

export default function Transactions() {
  const { expenses, categories, deleteExpense, settings } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  // Filter
  const filtered = useMemo(() => {
    return expenses.filter(exp => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        exp.title?.toLowerCase().includes(q) ||
        exp.note?.toLowerCase().includes(q) ||
        exp.category?.toLowerCase().includes(q);

      const matchesCat = filterCategory === 'all' || exp.category === filterCategory;

      const matchesDateFrom = !dateFrom || exp.date >= dateFrom;
      const matchesDateTo = !dateTo || exp.date <= dateTo;

      return matchesSearch && matchesCat && matchesDateFrom && matchesDateTo;
    });
  }, [expenses, search, filterCategory, dateFrom, dateTo]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(e => e.id)));
    }
  };

  const exportSelected = () => {
    const selectedExpenses = expenses.filter(e => selected.has(e.id));
    exportExpensesPDF(selectedExpenses, categories, null, settings.currency);
    setSelectionMode(false);
    setSelected(new Set());
  };

  const handleEdit = (exp) => {
    setEditData(exp);
    setShowForm(true);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterCategory('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = search || filterCategory !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your expenses</p>
        </div>
        <div className="flex items-center gap-2">
          {selectionMode ? (
            <>
              <span className="text-xs text-slate-500">{selected.size} selected</span>
              <button
                onClick={exportSelected}
                className="btn btn-primary btn-sm"
                disabled={selected.size === 0}
              >
                <FileText size={14} />
                Export PDF
              </button>
              <button onClick={() => { setSelectionMode(false); setSelected(new Set()); }} className="btn btn-outline btn-sm">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setSelectionMode(true)} className="btn btn-outline btn-sm">
                <CheckSquare size={14} />
                Select
              </button>
              <button onClick={() => { setEditData(null); setShowForm(true); }} className="btn btn-primary btn-sm">
                <Plus size={14} />
                Add Transaction
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <select
            className="input w-auto min-w-[140px]"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            className="input w-auto"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            placeholder="From"
          />
          <input
            type="date"
            className="input w-auto"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            placeholder="To"
          />

          {hasFilters && (
            <button onClick={clearFilters} className="btn btn-ghost btn-sm text-xs">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </Card>

      {/* Transaction List */}
      <Card className="overflow-hidden">
        {selectionMode && filtered.length > 0 && (
          <div className="px-5 py-2 bg-primary-50 border-b border-primary-100 flex items-center gap-3">
            <button onClick={selectAll} className="text-xs text-primary-600 font-medium hover:underline">
              {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {filtered.map((exp, i) => {
              const cat = categories.find(c => c.id === exp.category);
              return (
                <div
                  key={exp.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors animate-slide-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Checkbox */}
                  {selectionMode && (
                    <button onClick={() => toggleSelect(exp.id)} className="flex-shrink-0">
                      {selected.has(exp.id) ? (
                        <CheckSquare size={18} className="text-primary-600" />
                      ) : (
                        <Square size={18} className="text-slate-300" />
                      )}
                    </button>
                  )}

                  {/* Category Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${cat?.color || '#64748b'}20` }}
                  >
                    {cat ? (
                      <RenderIcon name={cat.icon} size={20} style={{ color: cat.color }} />
                    ) : (
                      <RenderIcon name="Package" size={20} className="text-slate-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{exp.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {exp.date ? format(new Date(exp.date), 'dd/MM/yyyy') : '—'}
                      {exp.note && ` · ${exp.note}`}
                    </p>
                  </div>

                  {/* Amount + Actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                      ₹{exp.amount?.toLocaleString()}
                    </span>

                    {exp.receiptUrl && (
                      <button
                        onClick={() => { setReceiptUrl(exp.receiptUrl); setShowReceipt(true); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        title="View receipt"
                      >
                        <Paperclip size={14} />
                      </button>
                    )}

                    {!selectionMode && (
                      <>
                        <button
                          onClick={() => handleEdit(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8">
            <EmptyState
              icon={Search}
              title="No transactions found"
              message="Try adjusting your filters or search term"
              action={
                !hasFilters && (
                  <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                    <Plus size={14} /> Add Transaction
                  </button>
                )
              }
            />
          </div>
        )}
      </Card>

      {/* Modals */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null); }}
        editData={editData}
      />
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        receiptUrl={receiptUrl}
      />
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteExpense(confirmDelete)}
      />
    </div>
  );
}
