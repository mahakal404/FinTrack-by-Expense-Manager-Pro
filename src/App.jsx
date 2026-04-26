import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Goals from './pages/Goals';
import Ledger from './pages/Ledger';
import Settings from './pages/Settings';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { currentUser } = useAuth();
  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: '!bg-slate-900 !text-slate-100 !rounded-xl text-sm font-medium border border-slate-700/50 shadow-2xl' }} />
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
          
          {/* Root route interception */}
          <Route path="/" element={currentUser ? <AppLayout /> : <LandingPage />}>
            <Route index element={currentUser ? <Dashboard /> : null} />
          </Route>

          {/* Protected internal routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </>
  );
}
