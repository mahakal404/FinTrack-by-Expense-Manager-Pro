import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Save, CalendarDays, RefreshCw } from 'lucide-react';
import Card from '../components/UI/Card';
import toast from 'react-hot-toast';

export default function Settings() {
  const { settings, updateSettings } = useApp();
  
  const [localSettings, setLocalSettings] = useState({
     dateFormat: 'dd/MM/yyyy',
     currency: '₹',
     monthlyBudget: 12000,
     monthlySalary: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
     if (settings) {
        setLocalSettings({
            dateFormat: settings.dateFormat || 'dd/MM/yyyy',
            currency: settings.currency || '₹',
            monthlyBudget: settings.monthlyBudget || 12000,
            monthlySalary: settings.monthlySalary || 0
        });
     }
  }, [settings]);

  const handleResetBudget = () => {
    const salary = parseFloat(localSettings.monthlySalary) || 0;
    if (salary > 0) {
      setLocalSettings(p => ({ ...p, monthlyBudget: Math.round(salary * 0.8) }));
      toast.success("Budget calculated (80% of salary)");
    } else {
      toast.error("Please set Monthly Salary first");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    let budget = parseFloat(localSettings.monthlyBudget) || 0;
    const salary = parseFloat(localSettings.monthlySalary) || 0;

    // Smart Auto-Budget: If budget is 0/blank, use 80% of salary
    if (budget === 0 && salary > 0) {
       budget = Math.round(salary * 0.8);
       setLocalSettings(p => ({ ...p, monthlyBudget: budget }));
    }

    try {
      await updateSettings({
         dateFormat: localSettings.dateFormat,
         currency: localSettings.currency,
         monthlyBudget: budget,
         monthlySalary: salary
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to update preferences");
    }
    setSaving(false);
  };

  const today = new Date();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pb-20 lg:pb-0">
      
      {/* Header */}
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
             <SettingsIcon size={20} className="text-white" />
         </div>
         <div>
            <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your application preferences</p>
         </div>
      </div>

      <Card className="p-6">
         <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
               <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                   <CalendarDays size={16} /> Date Configuration
               </h2>
               
               <div>
                  <label className="label">Date Format Preference</label>
                  <select 
                     className="input w-full max-w-sm" 
                     value={localSettings.dateFormat} 
                     onChange={e => setLocalSettings(p => ({ ...p, dateFormat: e.target.value }))}
                  >
                     <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                     <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                     <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">
                     Globally overrides dashboard interfaces, charts, and PDF executions.
                  </p>
               </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
               <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                   <RefreshCw size={16} /> Budget & Region
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <label className="label">Monthly Salary (Reference)</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{localSettings.currency}</span>
                          <input 
                             type="number" 
                             className="input pl-8" 
                             placeholder="0.00"
                             value={localSettings.monthlySalary} 
                             onChange={e => setLocalSettings(p => ({ ...p, monthlySalary: e.target.value }))}
                             min="0"
                          />
                       </div>
                       <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed"> Used for budget suggestions and automated financial planning. </p>
                   </div>

                   <div>
                      <div className="flex items-center justify-between">
                         <label className="label">Monthly Budget Targets</label>
                         <button 
                            type="button" 
                            onClick={handleResetBudget}
                            className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-tight"
                         >
                            Reset to 80%
                         </button>
                      </div>
                      <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{localSettings.currency}</span>
                         <input 
                            type="number" 
                            className="input pl-8" 
                            value={localSettings.monthlyBudget} 
                            onChange={e => setLocalSettings(p => ({ ...p, monthlyBudget: e.target.value }))}
                            min="0"
                         />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                         If left blank, budget will auto-calculate as 80% of salary.
                      </p>
                   </div>

                   <div>
                      <label className="label">Currency Symbol</label>
                      <select 
                         className="input" 
                         value={localSettings.currency} 
                         onChange={e => setLocalSettings(p => ({ ...p, currency: e.target.value }))}
                      >
                         <option value="₹">₹ (INR)</option>
                         <option value="$">$ (USD)</option>
                         <option value="€">€ (EUR)</option>
                         <option value="£">£ (GBP)</option>
                      </select>
                   </div>
               </div>
            </div>

            <div className="pt-2">
                <button type="submit" className="btn bg-slate-900 hover:bg-slate-800 text-slate-50 px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-slate-900/10 transition-transform active:scale-95" disabled={saving}>
                   <Save size={16} /> {saving ? 'Applying...' : 'Save Configurations'}
                </button>
            </div>
         </form>
      </Card>

    </div>
  );
}
