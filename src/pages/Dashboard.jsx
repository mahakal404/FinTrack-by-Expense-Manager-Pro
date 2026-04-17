import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import {
  ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp,
  Plus, Settings, Trash2, Paperclip, CalendarDays,
  FileText, Sparkles, Tag
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import StatCard from '../components/UI/StatCard';
import Card from '../components/UI/Card';
import ProgressBar from '../components/UI/ProgressBar';
import EmptyState from '../components/UI/EmptyState';
import TransactionForm from '../components/Transactions/TransactionForm';
import SalaryModal from '../components/Salary/SalaryModal';
import CategoryManager from '../components/Categories/CategoryManager';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import { exportExpensesPDF } from '../utils/pdfExport';
import { RenderIcon } from '../utils/icons';

export default function Dashboard() {
  const {
    expenses, salary, categories, settings, deleteExpense
  } = useApp();

  const [showAddTx, setShowAddTx] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Calculations
  const totalIncome = useMemo(() =>
    salary.reduce((sum, s) => sum + (s.amount || 0), 0),
    [salary]
  );

  const totalExpenses = useMemo(() =>
    expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses]
  );

  const netBalance = totalIncome - totalExpenses;
  const budget = settings.monthlyBudget || 0;
  const budgetPercent = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  const availableToSpend = totalIncome > 0 ? totalIncome - totalExpenses : budget - totalExpenses;

  // Category breakdown for donut chart
  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      const cat = categories.find(c => c.id === e.category) || { name: e.category || 'Other', color: '#64748b' };
      map[cat.name] = (map[cat.name] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => {
      const cat = categories.find(c => c.name === name);
      return { name, value, color: cat?.color || '#64748b' };
    }).sort((a, b) => b.value - a.value);
  }, [expenses, categories]);

  // Daily spending for bar chart (current month)
  const dailyData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const days = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days[dateStr] = 0;
    }

    expenses.forEach(e => {
      if (e.date && days[e.date] !== undefined) {
        days[e.date] += e.amount || 0;
      }
    });

    return Object.entries(days).map(([date, amount]) => ({
      date: format(new Date(date), 'dd/MM/yyyy'),
      amount,
    }));
  }, [expenses]);

  const recentExpenses = expenses.slice(0, 5);

  const getBudgetStatus = () => {
    if (budgetPercent >= 80) return { text: 'Over Budget!', class: 'badge-danger' };
    if (budgetPercent >= 60) return { text: 'Warning', class: 'badge-warning' };
    return { text: 'Safe', class: 'badge-success' };
  };
  const status = getBudgetStatus();

  const handleExport = (type) => {
    setExportMenuOpen(false);
    if (type === 'all') {
      exportExpensesPDF(expenses, categories, null, settings.currency);
    } else {
      // Export current month only
      const now = new Date();
      const monthExpenses = expenses.filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      exportExpensesPDF(monthExpenses, categories, {
        from: format(new Date(now.getFullYear(), now.getMonth(), 1), 'dd/MM/yyyy'),
        to: format(now, 'dd/MM/yyyy'),
      }, settings.currency);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <span className={`badge ${status.class}`}>{status.text}</span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">Overview of your financial health</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowSalary(true)} className="btn btn-outline btn-sm">
            <CalendarDays size={14} />
            Set Salary
          </button>
          <div className="relative">
            <button onClick={() => setExportMenuOpen(!exportMenuOpen)} className="btn btn-outline btn-sm">
              <FileText size={14} />
              Export Report ▾
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-elevated border border-slate-100 py-1 z-10 w-44 animate-scale-in">
                <button
                  onClick={() => handleExport('month')}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  This Month
                </button>
                <button
                  onClick={() => handleExport('all')}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  All Time
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setShowAddTx(true)} className="btn btn-primary btn-sm">
            <Plus size={14} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={ArrowDownLeft}
          label="Total Income"
          value={`₹${totalIncome.toLocaleString()}`}
          subtitle="All income transactions"
          accentColor="success"
        />
        <StatCard
          icon={ArrowUpRight}
          label="Total Expenses"
          value={`₹${totalExpenses.toLocaleString()}`}
          subtitle="All expense transactions"
          accentColor="danger"
        />
        <StatCard
          icon={Wallet}
          label="Net Balance"
          value={`₹${netBalance.toLocaleString()}`}
          subtitle="Income minus expenses"
          accentColor="primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Available to Spend"
          value={`₹${availableToSpend.toLocaleString()}`}
          subtitle={`Salary ₹${totalIncome.toLocaleString()} included`}
          accentColor="teal"
        />
      </div>

      {/* Budget + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Budget */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Monthly Budget</h2>
              <p className="text-xs text-slate-500">{Math.round(budgetPercent)}% of income used</p>
            </div>
            <span className={`text-2xl font-bold ${budgetPercent >= 80 ? 'text-danger-500' : budgetPercent >= 60 ? 'text-warning-500' : 'text-success-600'}`}>
              {Math.round(budgetPercent)}%
            </span>
          </div>
          <ProgressBar value={totalExpenses} max={budget || totalIncome} showPercent={false} size="lg" />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-500">Rs. {totalExpenses.toLocaleString()} spent</span>
            <span className="text-xs text-slate-500">Rs. {(budget || totalIncome).toLocaleString()} total income</span>
          </div>
        </Card>

        {/* Category Donut */}
        <Card className="p-5" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
          <h2 className="text-base font-semibold text-white mb-1">Expense Breakdown</h2>
          <p className="text-xs text-primary-200 mb-3">By category</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹${val.toLocaleString()}`}
                  contentStyle={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[160px] text-sm text-primary-200">
              No expense data yet
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions + Monthly Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Expenses */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent expenses</h2>
            <span className="text-xs text-slate-400">{expenses.length} items</span>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-2">
              {recentExpenses.map((exp, i) => {
                const cat = categories.find(c => c.id === exp.category);
                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${cat?.color || '#cbd5e1'}20` }}
                      >
                        {cat ? (
                          <RenderIcon name={cat.icon} size={20} style={{ color: cat.color }} />
                        ) : (
                          <RenderIcon name="Package" size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{cat?.name || exp.category}</p>
                        <p className="text-xs text-slate-400">
                          {exp.date ? format(new Date(exp.date), 'dd/MM/yyyy') : '—'} · {exp.note || exp.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        ₹{exp.amount?.toLocaleString()}
                      </span>
                      {exp.receiptUrl && (
                        <Paperclip size={12} className="text-slate-400" />
                      )}
                      <button
                        onClick={() => setConfirmDelete(exp.id)}
                        className="btn btn-outline btn-sm text-xs px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No expenses yet"
              message="Start tracking by adding your first transaction"
              action={
                <button onClick={() => setShowAddTx(true)} className="btn btn-primary btn-sm">
                  <Plus size={14} /> Add Transaction
                </button>
              }
            />
          )}
        </Card>

        {/* Monthly Snapshot */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Monthly snapshot</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">This month</span>
          </div>
          <div className="space-y-3 mb-4">
            {[
              { icon: CalendarDays, label: 'Budget', value: `₹${(budget || totalIncome).toLocaleString()}`, color: 'text-primary-600', bg: 'bg-primary-50' },
              { icon: ArrowUpRight, label: 'Spent', value: `₹${totalExpenses.toLocaleString()}`, color: 'text-danger-500', bg: 'bg-danger-50' },
              { icon: Wallet, label: 'Balance', value: `₹${netBalance.toLocaleString()}`, color: 'text-success-600', bg: 'bg-success-50' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-bold text-slate-800">{value}</p>
                  </div>
                </div>
                <TrendingUp size={14} className="text-slate-300" />
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="bg-primary-50/60 rounded-xl p-3 border border-primary-100">
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary-700">Tip</p>
                <p className="text-xs text-primary-600 leading-relaxed">
                  If you set your budget near 80% of salary, you'll see warnings early — before the month gets tight.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <TransactionForm isOpen={showAddTx} onClose={() => setShowAddTx(false)} />
      <SalaryModal isOpen={showSalary} onClose={() => setShowSalary(false)} />
      <CategoryManager isOpen={showCategories} onClose={() => setShowCategories(false)} />
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteExpense(confirmDelete)}
      />
    </div>
  );
}
