import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import FloatingActionButton from '../UI/FloatingActionButton';
import TransactionForm from '../Transactions/TransactionForm';

export default function AppLayout() {
  const [showAddTx, setShowAddTx] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <FloatingActionButton onClick={() => setShowAddTx(true)} />
      <TransactionForm isOpen={showAddTx} onClose={() => setShowAddTx(false)} />
    </div>
  );
}
