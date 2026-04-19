import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { Plus, Edit3, Trash2, Target, Calendar } from 'lucide-react';
import Card from '../components/UI/Card';
import ProgressBar from '../components/UI/ProgressBar';
import EmptyState from '../components/UI/EmptyState';
import GoalForm from '../components/Goals/GoalForm';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import { RenderIcon } from '../utils/icons';

export default function Goals() {
  const { goals, expenses, salary, addGoal, updateGoal, deleteGoal } = useApp();
  const { formatCurrency } = useSettings();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Average monthly savings
  const totalIncome = salary.reduce((s, sal) => s + (sal.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const avgMonthlySavings = Math.max(0, totalIncome - totalExpenses);

  const handleSubmit = async (data) => {
    if (editData) {
      await updateGoal(editData.id, data);
    } else {
      await addGoal(data);
    }
  };

  const handleEdit = (goal) => {
    setEditData(goal);
    setShowForm(true);
  };

  const getEstimatedMonths = (goal) => {
    const remaining = (goal.targetAmount || 0) - (goal.currentAmount || 0);
    if (remaining <= 0) return { text: 'Completed! 🎉', done: true };
    if (avgMonthlySavings <= 0) return { text: 'Set salary to estimate', done: false };
    const months = Math.ceil(remaining / avgMonthlySavings);
    if (months <= 1) return { text: '< 1 month', done: false };
    if (months <= 12) return { text: `~${months} months`, done: false };
    return { text: `~${(months / 12).toFixed(1)} years`, done: false };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Target size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Savings Goals</h1>
            <p className="text-sm text-slate-500">Track progress towards your financial targets</p>
          </div>
        </div>
        <button
          onClick={() => { setEditData(null); setShowForm(true); }}
          className="btn btn-primary btn-sm"
        >
          <Plus size={14} />
          New Goal
        </button>
      </div>

      {/* Savings Summary */}
      {salary.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-primary-50 to-teal-50 border-primary-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/80 rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-primary-700 font-medium">Estimated Monthly Savings</p>
              <p className="text-lg font-bold text-primary-800">{formatCurrency(avgMonthlySavings)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, i) => {
            const percent = goal.targetAmount > 0
              ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
              : 0;
            const est = getEstimatedMonths(goal);

            return (
              <Card
                key={goal.id}
                hover
                className="p-5 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary-500 shadow-sm border border-slate-100">
                      <RenderIcon name={goal.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{goal.title}</h3>
                      <p className="text-xs text-slate-500">
                        {est.done ? (
                          <span className="text-success-600 font-medium">{est.text}</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {est.text}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(goal.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <ProgressBar value={goal.currentAmount} max={goal.targetAmount} size="md" className="mb-3" />

                {/* Amounts */}
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">
                    {formatCurrency(goal.currentAmount || 0)} saved
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {formatCurrency(goal.targetAmount || 0)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8">
          <EmptyState
            icon={Target}
            title="No savings goals yet"
            message="Set financial targets and track your progress towards them"
            action={
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> Create First Goal
              </button>
            }
          />
        </Card>
      )}

      {/* Modals */}
      <GoalForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
      />
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteGoal(confirmDelete)}
        title="Delete Goal"
        message="This will permanently remove this savings goal."
      />
    </div>
  );
}
