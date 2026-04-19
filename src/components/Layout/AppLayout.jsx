import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';
import FloatingActionButton from '../UI/FloatingActionButton';
import TransactionForm from '../Transactions/TransactionForm';

export default function AppLayout() {
  const [showAddTx, setShowAddTx] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <MobileHeader />
        <main className="app-main flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
      <FloatingActionButton onClick={() => setShowAddTx(true)} />
      <TransactionForm isOpen={showAddTx} onClose={() => setShowAddTx(false)} />
    </div>
  );
}
