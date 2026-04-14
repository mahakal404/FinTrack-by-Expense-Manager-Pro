import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, FileText } from 'lucide-react';
import Card from '../components/UI/Card';
import { exportExpensesPDF } from '../utils/pdfExport';

const RANGE_OPTIONS = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: '30d', label: 'Last 30 Days' },
  { key: 'all', label: 'All Time' },
];

export default function Reports() {
  const { expenses, salary, categories, settings } = useApp();
  const [range, setRange] = useState('month');

  const rangeFilteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      if (!e.date) return range === 'all';
      const d = new Date(e.date);
      if (range === 'week') return d >= startOfWeek(now, { weekStartsOn: 1 });
      if (range === 'month') return d >= startOfMonth(now);
      if (range === '30d') return d >= subDays(now, 30);
      return true;
    });
  }, [expenses, range]);

  // Income vs Expense line chart data (daily for last 10 days)
  const trendData = useMemo(() => {
    const now = new Date();
    const days = [];
    for (let i = 9; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayExpenses = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const dayIncome = salary.find(s => {
        return s.month === (date.getMonth() + 1) && s.year === date.getFullYear();
      });
      days.push({
        date: format(date, 'd MMM'),
        Expense: dayExpenses,
        Income: i === 0 ? (dayIncome?.amount || 0) : 0,
      });
    }
    return days;
  }, [expenses, salary]);

  // Category split donut
  const categoryData = useMemo(() => {
    const map = {};
    rangeFilteredExpenses.forEach(e => {
      const cat = categories.find(c => c.id === e.category) || { name: 'Other', color: '#64748b' };
      map[cat.name] = { value: (map[cat.name]?.value || 0) + (e.amount || 0), color: cat.color };
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);
  }, [rangeFilteredExpenses, categories]);

  // Daily expenses bar chart
  const dailyBarData = useMemo(() => {
    const now = new Date();
    const data = [];
    for (let i = 9; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const total = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      data.push({
        date: format(date, 'd MMM'),
        amount: total,
      });
    }
    return data;
  }, [expenses]);

  const totalFiltered = rangeFilteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  const handleExport = () => {
    exportExpensesPDF(rangeFilteredExpenses, categories, null, settings.currency);
  };

  const chartTooltipStyle = {
    background: 'white',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontSize: '12px',
    padding: '8px 12px',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
            <p className="text-sm text-slate-500">Daily, monthly & category insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setRange(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${range === opt.key
                    ? 'bg-white text-primary-600 shadow-soft'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="btn btn-outline btn-sm">
            <FileText size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xs text-slate-500">Transactions</p>
          <p className="text-xl font-bold text-slate-800">{rangeFilteredExpenses.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-slate-500">Total Spent</p>
          <p className="text-xl font-bold text-danger-600">₹{totalFiltered.toLocaleString()}</p>
        </Card>
        <Card className="p-4 text-center sm:col-span-1 col-span-2">
          <p className="text-xs text-slate-500">Avg per Day</p>
          <p className="text-xl font-bold text-primary-600">
            ₹{rangeFilteredExpenses.length > 0
              ? Math.round(totalFiltered / Math.max(1, new Set(rangeFilteredExpenses.map(e => e.date)).size)).toLocaleString()
              : 0
            }
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income vs Expense Line Chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">Income vs Expense</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">A simple trend view for the last 10 days.</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(val) => `₹${val.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="Income" stroke="#14b8a6" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Expense" stroke="#6366f1" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Donut */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-1">Category split</h2>
          <p className="text-xs text-slate-500 mb-3">Where your money went.</p>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `₹${val.toLocaleString()}`}
                    contentStyle={chartTooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="space-y-1.5 mt-3">
                {categoryData.slice(0, 5).map(cat => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs text-slate-600">{cat.name}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-700">₹{cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-slate-400">
              No data for this period
            </div>
          )}
        </Card>
      </div>

      {/* Daily expenses bar chart */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-slate-500" />
          <h2 className="text-base font-semibold text-slate-800">Daily expenses</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">Quick bars for scanning days with higher spending.</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dailyBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(val) => `₹${val.toLocaleString()}`}
            />
            <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
