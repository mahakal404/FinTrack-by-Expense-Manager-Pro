import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, Plus, TrendingUp, TrendingDown, ArrowRight, FileText, CheckCircle2, ChevronRight, Calculator, Archive, Trash2, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import Card from '../components/UI/Card';
import EmptyState from '../components/UI/EmptyState';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Modal from '../components/UI/Modal';
import toast from 'react-hot-toast';
import { exportProjectPDF } from '../utils/projectPdfExport';

export default function Projects() {
  const { projects, projectExpenses, categories, addProject, updateProject, deleteProject, settings } = useApp();
  
  const [showForm, setShowForm] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', payerName: '', openingBalance: '' });

  const activeProjectCount = projects.filter(p => p.status === 'active').length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updateProject(editId, {
          name: form.name.trim(),
          payerName: form.payerName.trim(),
          openingBalance: parseFloat(form.openingBalance) || 0
        });
        toast.success("Project updated successfully!");
      } else {
        await addProject({
          name: form.name.trim(),
          payerName: form.payerName.trim(),
          openingBalance: parseFloat(form.openingBalance) || 0,
          status: 'active'
        });
        toast.success("Project Ledger Created!");
      }
      
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', payerName: '', openingBalance: '' });
    } catch (err) {
      toast.error(editId ? "Failed to update project" : "Failed to create project");
    }
    setSaving(false);
  };

  const handleEditInit = (e, p) => {
    e.stopPropagation();
    setForm({
      name: p.name,
      payerName: p.payerName || '',
      openingBalance: p.openingBalance?.toString() || '0'
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const executeDelete = async (id) => {
     try {
       await deleteProject(id);
       toast.success("Ledger deleted entirely.");
       if(activeProjectId === id) setActiveProjectId(null);
     } catch (err) {
       toast.error("Failed to delete project");
     }
  };

  const selectedProject = projects.find(p => p.id === activeProjectId);
  const selectedExpenses = useMemo(() => {
    return projectExpenses.filter(e => e.projectId === activeProjectId)
                          .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [projectExpenses, activeProjectId]);

  const totalSpent = selectedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const closingBalance = selectedProject ? (selectedProject.openingBalance - totalSpent) : 0;

  const handleExport = () => {
    if (!selectedProject) return;
    exportProjectPDF(selectedProject, selectedExpenses, categories, settings);
  };

  const handleArchive = async () => {
    if (!selectedProject || !window.confirm("Close this project? You won't be able to assign new transactions to it.")) return;
    await updateProject(selectedProject.id, { status: 'closed' });
    toast.success("Project closed and archived");
    setActiveProjectId(null);
  };

  const getStatusBadge = (status) => {
     if (status === 'active') return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>;
     return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-500/10 text-slate-500 border border-slate-500/20">Closed</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                 <Briefcase size={20} className="text-amber-500" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-800">Project Ledger</h1>
                <p className="text-sm text-slate-500 mt-0.5">Isolated specific project budgets</p>
             </div>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="btn bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow shadow-amber-500/20 px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={16} /> Start Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* LEFT COLUMN: Project List */}
         <div className="lg:col-span-4 space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Your Projects ({activeProjectCount})</h2>
             </div>

             {projects.length === 0 ? (
                 <Card className="p-8 text-center border-dashed border-2 border-slate-200">
                     <div className="w-16 h-16 rounded-full bg-amber-50 mx-auto flex items-center justify-center text-amber-500 mb-4">
                         <Briefcase size={24} />
                     </div>
                     <h3 className="font-semibold text-slate-800 mb-1">No ledgers yet</h3>
                     <p className="text-sm text-slate-500">Start tracking external project expenses safely segregated from your main dashboard.</p>
                 </Card>
             ) : (
                <div className="space-y-3">
                    {projects.map(p => {
                       const bSpent = projectExpenses.filter(e => e.projectId === p.id).reduce((sum, e) => sum + (e.amount || 0), 0);
                       const perc = p.openingBalance > 0 ? (bSpent / p.openingBalance) * 100 : 0;
                       
                       return (
                         <div 
                            key={p.id} 
                            onClick={() => setActiveProjectId(p.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${activeProjectId === p.id ? 'bg-amber-50 border-amber-500 shadow-md shadow-amber-500/10' : 'bg-white border-slate-200 hover:border-amber-300'}`}
                         >
                            <div className="flex items-start justify-between mb-2">
                               <div>
                                  <h3 className={`font-bold ${activeProjectId === p.id ? 'text-amber-800' : 'text-slate-800'} line-clamp-1`}>{p.name}</h3>
                                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                                      {getStatusBadge(p.status)} {p.payerName}
                                  </p>
                               </div>
                               <div className="flex items-center gap-1">
                                   <button onClick={(e) => handleEditInit(e, p)} className={`p-1.5 rounded text-amber-600/50 hover:bg-amber-100 hover:text-amber-600`} title="Edit properties">
                                       <Edit3 size={15} />
                                   </button>
                                   <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(p.id); }} className={`p-1.5 rounded text-red-500/50 hover:bg-red-50 hover:text-red-500`} title="Delete strictly">
                                       <Trash2 size={15} />
                                   </button>
                               </div>
                            </div>
                         </div>
                       )
                    })}
                </div>
             )}
         </div>

         {/* RIGHT COLUMN: Project Details Container */}
         <div className="lg:col-span-8">
             {selectedProject ? (
                 <Card className="overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/40">
                    
                    {/* Header Banner */}
                    <div className="bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Briefcase size={140} />
                       </div>
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                             <div>
                                {getStatusBadge(selectedProject.status)}
                                <h2 className="text-2xl font-bold text-slate-50 mt-2">{selectedProject.name}</h2>
                                <p className="text-amber-400 font-medium text-sm flex items-center gap-1.5 mt-1">
                                    Payer: {selectedProject.payerName}
                                </p>
                             </div>
                             <div className="flex items-center gap-2">
                                <button onClick={handleExport} className="btn bg-white/10 hover:bg-white/20 text-white border-transparent text-sm">
                                   <FileText size={16} /> Export Claim
                                </button>
                                {selectedProject.status === 'active' && (
                                    <button onClick={handleArchive} className="p-2 sm:px-3 sm:py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 transition-colors" title="Mark as Closed">
                                        <Archive size={16} className="sm:hidden" />
                                        <span className="hidden sm:block text-sm font-medium text-amber-500">Close Ledger</span>
                                    </button>
                                )}
                             </div>
                          </div>

                          {/* 3 Column Stats */}
                          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                              <div>
                                 <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><TrendingUp size={12} className="text-emerald-400" /> Funds Received</p>
                                 <p className="text-lg sm:text-2xl font-bold">₹{selectedProject.openingBalance?.toLocaleString()}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><TrendingDown size={12} className="text-rose-400" /> Total Spent</p>
                                 <p className="text-lg sm:text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] sm:text-xs text-amber-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Calculator size={12} /> Closing Balance</p>
                                 <p className="text-lg sm:text-2xl font-bold text-amber-500">₹{closingBalance.toLocaleString()}</p>
                              </div>
                          </div>
                       </div>
                    </div>

                    {/* Transaction List */}
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center gap-2">
                       <CheckCircle2 size={16} className="text-slate-400" />
                       <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Itemized Expenses</span>
                    </div>

                    {selectedExpenses.length > 0 ? (
                       <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                           {selectedExpenses.map((exp, i) => {
                              const cat = categories.find(c => c.id === exp.category);
                              return (
                                 <div key={exp.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                                    <div>
                                       <p className="text-sm font-semibold text-slate-800">{cat?.name || exp.category} {exp.provider && <span className="text-amber-600 font-semibold text-xs px-1.5">• {exp.provider}</span>}</p>
                                       <p className="text-xs text-slate-500 mt-1">
                                          {exp.date ? format(new Date(exp.date), settings?.dateFormat || 'dd/MM/yyyy') : '-'}
                                          {exp.title && ` · ${exp.title}`}
                                       </p>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-sm font-bold text-slate-800">₹{exp.amount?.toLocaleString()}</p>
                                       {exp.receiptUrl && <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full mt-1 inline-block">Has Receipt</span>}
                                    </div>
                                 </div>
                              )
                           })}
                       </div>
                    ) : (
                       <div className="p-10 text-center">
                          <p className="text-slate-500 text-sm">No expenses logged against this project yet.</p>
                          <p className="text-xs text-slate-400 mt-2">Use the "Assign to Project?" option when adding a transaction.</p>
                       </div>
                    )}
                 </Card>
             ) : (
                 <div className="h-full min-h-[400px] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                     <p className="flex items-center gap-2"><ArrowRight size={16} /> Select a project to view its ledger</p>
                 </div>
             )}
         </div>

      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Initialize Project" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="label">Project Title</label>
              <input type="text" className="input bg-slate-50" placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
           </div>
           <div>
              <label className="label">Client / Payer Name</label>
              <input type="text" className="input bg-slate-50" placeholder="e.g. Acme Corp" value={form.payerName} onChange={e => setForm(p => ({...p, payerName: e.target.value}))} required />
           </div>
           <div>
              <label className="label text-emerald-600 font-semibold">Funds Received (₹)</label>
              <input type="number" className="input border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500" placeholder="0.00" value={form.openingBalance} onChange={e => setForm(p => ({...p, openingBalance: e.target.value}))} required />
              <p className="text-[11px] text-slate-500 mt-1">This acts as the opening balance for your ledger.</p>
           </div>
           <button type="submit" className="w-full btn bg-slate-900 hover:bg-slate-800 text-amber-500 mt-4 rounded-xl py-3 shadow-xl shadow-slate-900/10" disabled={saving}>
              {saving ? (editId ? 'Updating...' : 'Creating...') : (editId ? 'Commit Details' : 'Open Ledger')}
           </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => executeDelete(confirmDelete)}
        title="Delete strict Project Ledger"
        message="This violently deletes the project container. Do you want to continue?"
      />

    </div>
  );
}
