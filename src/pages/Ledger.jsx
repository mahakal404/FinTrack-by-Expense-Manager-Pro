import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, Plus, TrendingUp, TrendingDown, ArrowRight, FileText, FileDown, CheckCircle2, ChevronRight, Calculator, Archive, Trash2, Edit3, History, Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { format, isValid } from 'date-fns';
import Card from '../components/UI/Card';
import EmptyState from '../components/UI/EmptyState';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Modal from '../components/UI/Modal';
import toast from 'react-hot-toast';
import { exportLedgerPDF } from '../utils/ledgerPdfExport';
import TransactionForm from '../components/Transactions/TransactionForm';
import ReceiptViewer from '../components/Transactions/ReceiptViewer';

export default function Ledger() {
  const { projects, projectExpenses, categories, addProject, updateProject, deleteProject, settings, deleteExpense } = useApp();
  
  const [showForm, setShowForm] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', payerName: '', openingBalance: '' });
  
  // Tab state: 'active' | 'closed'
  const [confirmArchive, setConfirmArchive] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [includeReceiptsInPdf, setIncludeReceiptsInPdf] = useState(true);

  // Nested Expense Edit state
  const [editExpense, setEditExpense] = useState(null);
  const [confirmDeleteExpense, setConfirmDeleteExpense] = useState(null);
  const [viewReceiptUrl, setViewReceiptUrl] = useState(null);

  const activeProjectCount = projects.filter(p => p.status === 'active').length;
  const closedProjectCount = projects.filter(p => p.status === 'closed').length;

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
        toast.success("Ledger updated successfully!");
      } else {
        await addProject({
          name: form.name.trim(),
          payerName: form.payerName.trim(),
          openingBalance: parseFloat(form.openingBalance) || 0,
          status: 'active'
        });
        toast.success("Smart Ledger Created!");
      }
      
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', payerName: '', openingBalance: '' });
    } catch (err) {
      toast.error(editId ? "Failed to update ledger" : "Failed to create ledger");
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
       toast.error("Failed to delete ledger");
     }
  };

  const executeDeleteExpense = async (id) => {
     try {
       await deleteExpense(id);
       toast.success("Entry removed securely.");
     } catch(err) {
       toast.error("Failed to delete entry.");
     }
  };

  const selectedProject = projects.find(p => p.id === activeProjectId);
  const selectedExpenses = useMemo(() => {
    return projectExpenses.filter(e => e.projectId === activeProjectId)
                          .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [projectExpenses, activeProjectId]);

  const totalSpent = selectedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const closingBalance = selectedProject ? ((selectedProject.openingBalance || 0) - totalSpent) : 0;

  const handleExport = () => {
    if (!selectedProject) return;
    setShowExportModal(true);
  };

  const executeExport = async () => {
    setExporting(true);
    setShowExportModal(false);
    // Smooth delay for UI feel
    await new Promise(r => setTimeout(r, 100));
    try {
      await exportLedgerPDF(selectedProject, selectedExpenses, categories, settings, {
        includeReceipts: includeReceiptsInPdf
      });
    } catch (err) {
      toast.error(`Export Error: ${err.message}`);
      console.error(err);
    }
    setExporting(false);
  };

  const handleArchive = () => {
    if (!selectedProject) return;
    setConfirmArchive(selectedProject.id);
  };
  
  const executeArchive = async () => {
    if (!confirmArchive) return;
    await updateProject(confirmArchive, { status: 'closed' });
    toast.success("Ledger moved to History successfully!");
    setActiveProjectId(null);
    setConfirmArchive(null);
  };

  const handleReactivate = async () => {
    if (!selectedProject) return;
    await updateProject(selectedProject.id, { status: 'active' });
    toast.success("Smart Ledger Re-activated!");
    setViewTab('active');
  };

  const getStatusBadge = (status) => {
     if (status === 'active') return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>;
     return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-500/10 text-slate-500 border border-slate-500/20">Closed</span>;
  };

  const filteredList = projects.filter(p => p.status === viewTab);

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      
      {/* Header */}
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                 <Briefcase size={20} className="text-amber-500" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-800">Smart Ledger</h1>
                <p className="text-sm text-slate-500 mt-0.5">Track isolated custom contracts strictly</p>
             </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => { setEditId(null); setForm({ name:'', payerName:'', openingBalance:''}); setShowForm(true); }} className="btn bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 px-5 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-transform active:scale-95">
              <Plus size={18} /> Create Your Ledger
            </button>
            <button onClick={() => setShowExpenseForm(true)} className="btn bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-500/30 shadow-sm px-5 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-transform active:scale-95">
              <Plus size={18} /> Add Transaction
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* LEFT COLUMN: Project List */}
         <div className="lg:col-span-4 space-y-4">
             {/* Dynamic Custom Tabs */}
             <div className="flex bg-slate-100 rounded-xl p-1 mb-2">
               <button
                  onClick={() => setViewTab('active')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${viewTab === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <Activity size={16} /> Active ({activeProjectCount})
               </button>
               <button
                  onClick={() => setViewTab('closed')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${viewTab === 'closed' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <History size={16} /> History ({closedProjectCount})
               </button>
             </div>

             {filteredList.length === 0 ? (
                 <Card className="p-8 text-center border-dashed border-2 border-slate-200">
                     <div className="w-16 h-16 rounded-full bg-amber-50 mx-auto flex items-center justify-center text-amber-500 mb-4">
                         <Briefcase size={24} />
                     </div>
                     <h3 className="font-semibold text-slate-800 mb-1">No ledgers found</h3>
                     <p className="text-sm text-slate-500">You don't have any {viewTab} ledgers open presently.</p>
                 </Card>
             ) : (
                <div className="space-y-3">
                    {filteredList.map(p => {
                       return (
                         <div 
                            key={p.id} 
                            onClick={() => setActiveProjectId(p.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${activeProjectId === p.id ? 'bg-amber-50 border-amber-500 shadow-md shadow-amber-500/10' : 'bg-white border-slate-200 hover:border-amber-300'} ${p.status === 'closed' ? 'opacity-80 grayscale-[20%]' : ''}`}
                         >
                            <div className="flex items-start justify-between mb-2">
                               <div>
                                  <h3 className={`font-bold ${activeProjectId === p.id ? 'text-amber-800' : 'text-slate-800'} line-clamp-1`}>{p.name}</h3>
                                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                                      {getStatusBadge(p.status)} {p.payerName && <span>· {p.payerName}</span>}
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
                                {selectedProject.payerName && (
                                   <p className="text-amber-400 font-medium text-sm flex items-center gap-1.5 mt-1">
                                       Payer: {selectedProject.payerName}
                                   </p>
                                )}
                             </div>
                             <div className="flex items-center gap-2">
                                <button onClick={handleExport} disabled={exporting} className="btn bg-amber-500 hover:bg-amber-600 text-slate-900 border-transparent text-sm font-bold shadow-lg shadow-amber-500/20 px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                                   <FileDown size={18} className="text-slate-900" /> {exporting ? 'Generating...' : 'Download Report'}
                                </button>
                                {selectedProject.status === 'active' ? (
                                    <button onClick={handleArchive} className="p-2 sm:px-3 sm:py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors" title="Mark as Closed">
                                        <Archive size={16} className="sm:hidden" />
                                        <span className="hidden sm:block text-sm font-medium text-red-400">Close Ledger</span>
                                    </button>
                                ) : (
                                    <button onClick={handleReactivate} className="p-2 sm:px-3 sm:py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 transition-colors border border-emerald-500/30 shadow-sm" title="Reactivate Ledger">
                                        <RefreshCw size={16} className="sm:hidden" />
                                        <span className="hidden sm:block text-sm font-medium text-emerald-400">Reactivate</span>
                                    </button>
                                )}
                             </div>
                          </div>

                          {/* 3 Column Stats */}
                          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                              <div>
                                 <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><TrendingUp size={12} className="text-emerald-400" /> Funds Received ({settings?.currency || '₹'})</p>
                                 <p className="text-lg sm:text-2xl font-bold">{settings?.currency || '₹'}{(selectedProject.openingBalance || 0).toLocaleString('en-IN')}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><TrendingDown size={12} className="text-rose-400" /> Total Spent</p>
                                 <p className="text-lg sm:text-2xl font-bold">{settings?.currency || '₹'}{totalSpent.toLocaleString('en-IN')}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] sm:text-xs text-amber-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1"><Calculator size={12} /> Closing Balance</p>
                                 <p className="text-lg sm:text-2xl font-bold text-amber-500">{settings?.currency || '₹'}{closingBalance.toLocaleString('en-IN')}</p>
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
                       <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto w-full">
                           {selectedExpenses.map((exp, i) => {
                              const cat = categories.find(c => c.id === exp.category);
                              
                              const dt = exp.date ? new Date(exp.date) : null;
                              const safeDate = (dt && isValid(dt)) ? format(dt, settings?.dateFormat || 'dd/MM/yyyy') : '-';

                              return (
                                 <div key={exp.id} className="p-4 sm:p-5 group flex items-center justify-between hover:bg-slate-50/50 transition-colors animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                                    <div className="flex-1 overflow-hidden pr-2">
                                       <p className="text-sm font-semibold text-slate-800">{cat?.name || exp.category} {exp.provider && <span className="text-amber-600 font-semibold text-xs px-1.5">• {exp.provider}</span>}</p>
                                       <p className="text-xs text-slate-500 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                          {safeDate}
                                          {exp.title && ` · ${exp.title}`}
                                       </p>
                                    </div>

                                    {/* Control cluster perpetually visible */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                       <div className="flex items-center gap-1.5 opacity-100 transition-opacity">
                                          <button onClick={() => setEditExpense(exp)} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors bg-white shadow-sm" title="Edit Item">
                                             <Edit3 size={15} />
                                          </button>
                                          <button onClick={() => setConfirmDeleteExpense(exp.id)} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors bg-white shadow-sm" title="Delete Item">
                                             <Trash2 size={15} />
                                          </button>
                                       </div>
                                       
                                       <div className="text-right w-20 flex-shrink-0">
                                          <p className="text-sm font-bold text-slate-800">{settings?.currency || '₹'}{exp.amount?.toLocaleString('en-IN')}</p>
                                          {exp.receiptUrl && <span onClick={(e) => { e.stopPropagation(); setViewReceiptUrl(exp.receiptUrl); }} className="text-[10px] font-medium text-slate-400 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 hover:border-amber-200 cursor-pointer px-2 py-0.5 rounded-full mt-1 inline-block border border-slate-200 shadow-sm transition-colors">View Receipt</span>}
                                       </div>
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
                     <p className="flex items-center gap-2"><ArrowRight size={16} /> Select a ledger to view balances</p>
                 </div>
             )}
         </div>

      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? "Update Ledger" : "Initialize Ledger"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="label">Project Title</label>
              <input type="text" className="input bg-slate-50" placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
           </div>
           <div>
              <label className="label">Client / Payer Name <span className="text-slate-400 font-normal text-[11px]">(Optional)</span></label>
              <input type="text" className="input bg-slate-50" placeholder="e.g. Acme Corp" value={form.payerName} onChange={e => setForm(p => ({...p, payerName: e.target.value}))} />
           </div>
           <div>
              <label className="label text-emerald-600 font-semibold">Funds Received ({settings?.currency || '₹'})</label>
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
        title="Delete strict Ledger"
        message="This violently deletes the ledger container. Do you want to continue?"
      />

      {/* Custom Archive Modal */}
      {!!confirmArchive && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setConfirmArchive(null)}>
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-900/20 w-full max-w-sm overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 text-center bg-slate-900 relative">
               <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/30">
                  <AlertTriangle size={32} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Archive this Ledger?</h3>
               <p className="text-sm text-slate-400">You can always reactivate it from the History tab.</p>
            </div>
            <div className="p-6 flex items-center gap-3 bg-white">
               <button onClick={() => setConfirmArchive(null)} className="flex-1 btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl border-transparent transition-colors">
                 Cancel
               </button>
               <button onClick={executeArchive} className="flex-1 btn bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl border-transparent shadow-lg shadow-amber-500/30 transition-all">
                 Yes, Close Ledger
               </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteExpense}
        onClose={() => setConfirmDeleteExpense(null)}
        onConfirm={() => executeDeleteExpense(confirmDeleteExpense)}
        title="Delete strict Entry"
        message="This permanently reverses this expenditure from your selected ledger. Proceed?"
      />

      {(!!editExpense || showExpenseForm) && (
         <TransactionForm 
            isOpen={true}
            editData={editExpense}
            onClose={() => { setEditExpense(null); setShowExpenseForm(false); }}
         />
      )}

      <ReceiptViewer 
         isOpen={!!viewReceiptUrl}
         onClose={() => setViewReceiptUrl(null)}
         url={viewReceiptUrl}
      />

      {/* Download Settings Modal */}
      <Modal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        title="Download Settings" 
        size="sm"
      >
        <div className="space-y-6 py-2">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Include Receipts</p>
                <p className="text-[10px] text-slate-500">Embed itemized images/PDFs</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={includeReceiptsInPdf} 
                onChange={e => setIncludeReceiptsInPdf(e.target.checked)} 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
             <p className="text-[11px] text-amber-800 flex gap-2">
               <AlertTriangle size={14} className="shrink-0" />
               Note: Including receipts will make the PDF file size larger.
             </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowExportModal(false)} className="flex-1 btn bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 rounded-xl border-transparent">
              Cancel
            </button>
            <button onClick={executeExport} className="flex-1 btn bg-slate-900 hover:bg-slate-800 text-amber-500 font-bold py-3 rounded-xl border-transparent shadow-lg shadow-slate-900/20">
              Download PDF
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
