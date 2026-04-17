import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/Layout/AppLayout';
import Reports from './pages/Reports';
import Goals from './pages/Goals';
import Ledger from './pages/Ledger';
import Settings from './pages/Settings';
import Login from './pages/Login';

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: '!bg-slate-900 !text-slate-100 !rounded-xl text-sm font-medium border border-slate-700/50 shadow-2xl' }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}
